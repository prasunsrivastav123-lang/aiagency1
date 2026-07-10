/**
 * crawlWebsite.js
 * -----------------------------------------------------------------------
 * STEP 1 + STEP 2 of the enrichment pipeline:
 *   1. Download the homepage.
 *   2. Auto-discover and crawl likely high-value pages:
 *      /contact, /about, /contact-us, /contactus, /about-us, /team,
 *      /locations, /branches, /privacy, plus any footer links matching
 *      those same keywords (many sites only link "Contact" from the
 *      footer, not the nav).
 *
 * Design notes:
 *  - Uses the shared cache so re-enriching the same domain (e.g. when a
 *    user re-scores a lead) doesn't re-download pages.
 *  - Uses dedupeFetch so N concurrent calls for the same URL collapse
 *    into a single network request.
 *  - Caps total pages crawled (MAX_PAGES) to keep this fast and polite.
 *  - Never throws: a failed sub-page is simply skipped.
 * -----------------------------------------------------------------------
 */

import * as cheerio from 'cheerio'
import { safeFetch } from './fetchWithTimeout'
import { dedupeFetch } from './cache'
import { resolveUrl, normalizeUrlKey } from './normalize'

const MAX_PAGES = 6 // homepage + up to 5 discovered pages
const CRAWL_TIMEOUT_MS = 10_000

// Keywords used to recognize valuable internal pages from link text/href.
const TARGET_KEYWORDS = [
  'contact-us',
  'contactus',
  'contact',
  'about-us',
  'aboutus',
  'about',
  'team',
  'locations',
  'branches',
  'privacy',
  'reach-us',
  'get-in-touch',
]

function scoreLinkRelevance(href = '', text = '') {
  const haystack = `${href} ${text}`.toLowerCase()
  for (let i = 0; i < TARGET_KEYWORDS.length; i++) {
    if (haystack.includes(TARGET_KEYWORDS[i])) {
      // Earlier keywords (more specific, e.g. "contact-us") score higher.
      return TARGET_KEYWORDS.length - i
    }
  }
  return 0
}

/**
 * Discover candidate internal URLs from a parsed homepage (nav + footer + body).
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {string[]} ranked, deduped, absolute URLs (excludes homepage itself)
 */
function discoverLinks($, baseUrl) {
  const homeKey = normalizeUrlKey(baseUrl)
  const candidates = new Map() // key -> { url, score }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    const text = $(el).text() || ''
    const absolute = resolveUrl(href, baseUrl)
    if (!absolute) return

    let parsed
    try {
      parsed = new URL(absolute)
    } catch {
      return
    }

    // Only crawl same-domain pages; skip mailto/tel/anchors/external links.
    let baseHost
    try {
      baseHost = new URL(baseUrl).hostname.replace(/^www\./, '')
    } catch {
      baseHost = ''
    }
    if (parsed.protocol.startsWith('mailto') || parsed.protocol.startsWith('tel')) return
    if (parsed.hostname.replace(/^www\./, '') !== baseHost) return

    const key = normalizeUrlKey(absolute)
    if (key === homeKey) return

    const score = scoreLinkRelevance(parsed.pathname, text)
    if (score <= 0) return

    const existing = candidates.get(key)
    if (!existing || existing.score < score) {
      candidates.set(key, { url: absolute, score })
    }
  })

  return Array.from(candidates.values())
    .sort((a, b) => b.score - a.score)
    .map((c) => c.url)
}

/**
 * Fetch and parse a single page (cached + deduped + timeout-safe).
 * @param {string} url
 * @returns {Promise<{ url:string, html:string, $: cheerio.CheerioAPI } | null>}
 */
async function fetchPage(url) {
  const key = normalizeUrlKey(url)
  return dedupeFetch(`page:${key}`, async () => {
    const res = await safeFetch(url, { timeoutMs: CRAWL_TIMEOUT_MS })
    if (!res.ok || !res.text) return null
    try {
      const $ = cheerio.load(res.text)
      return { url: res.url || url, html: res.text, $ }
    } catch {
      return null
    }
  })
}

/**
 * Crawl a website starting from its homepage.
 * @param {string} startUrl
 * @returns {Promise<{
 *   homepage: { url:string, html:string, $:cheerio.CheerioAPI } | null,
 *   pages: Array<{ url:string, html:string, $:cheerio.CheerioAPI }>,
 *   allPages: Array<{ url:string, html:string, $:cheerio.CheerioAPI }>,
 * }>}
 */
export async function crawlWebsite(startUrl) {
  const normalizedStart = /^https?:\/\//i.test(startUrl) ? startUrl : `https://${startUrl}`

  const homepage = await fetchPage(normalizedStart).catch(() => null)

  if (!homepage) {
    return { homepage: null, pages: [], allPages: [] }
  }

  let candidateLinks = []
  try {
    candidateLinks = discoverLinks(homepage.$, homepage.url).slice(0, MAX_PAGES - 1)
  } catch {
    candidateLinks = []
  }

  const settled = await Promise.allSettled(candidateLinks.map((url) => fetchPage(url)))
  const pages = settled
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value)

  return { homepage, pages, allPages: [homepage, ...pages] }
}