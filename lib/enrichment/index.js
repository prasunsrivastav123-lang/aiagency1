/**
 * index.js
 * -----------------------------------------------------------------------
 * PUBLIC ENTRY POINT — the only thing the rest of the app imports:
 *
 *     import { enrichWebsite } from "@/lib/enrichment"
 *
 * Signature and output shape are a strict contract with app/api/[[...path]]/route.js
 * (leads/enrich route). DO NOT rename existing output fields — only add
 * new ones. This file only orchestrates; all real logic lives in the
 * focused extractor modules alongside it.
 *
 * Pipeline:
 *   1. crawlWebsite()        -> homepage + up to 5 discovered pages
 *   2. extractSchema()       -> JSON-LD business metadata (highest trust)
 *   3. per-page extraction   -> phones, emails, whatsapp, socials, hours
 *      (run with Promise.allSettled so one failing page/extractor never
 *      blocks the others)
 *   4. extractBusinessInfo() -> name, tagline, logo, hero, services, etc.
 *   5. confidence.js         -> per-field confidence + completeness + gaps
 *
 * Reliability guarantees (per spec):
 *   - Never throws. Any failure anywhere returns the best-effort partial
 *     result instead of rejecting.
 *   - 10s timeout per network request (enforced in fetchWithTimeout.js).
 *   - Already-crawled pages are cached and de-duplicated in-flight
 *     (cache.js) so re-enriching the same domain is fast.
 *   - Promise.all / Promise.allSettled used throughout for parallelism.
 * -----------------------------------------------------------------------
 */

import * as cheerio from 'cheerio'
import { crawlWebsite } from './crawlWebsite'
import { extractPhones } from './extractPhones'
import { extractEmails } from './extractEmails'
import { extractWhatsApp } from './extractWhatsApp'
import { extractSocials } from './extractSocials'
import { extractHours } from './extractHours'
import { extractSchema } from './extractSchema'
import { extractBusinessInfo } from './extractBusinessInfo'
import { computeConfidenceAndCompleteness } from './confidence'
import { dedupeStrings } from './normalize'

/** The exact backward-compatible output shape. Every key must always exist. */
function emptyResult() {
  return {
    phones: [],
    emails: [],
    whatsapp: '',
    socials: {},
    hours: {},
    logo: '',
    heroImage: '',
    businessName: '',
    description: '',
    services: [],
    faq: [],
    testimonials: [],
    pricing: [],
    bookingUrl: '',
    maps: '',
    schema: {},
    colors: [],
    confidence: { phone: 0, email: 0, website: 0 },
    completeness: 0,
    missingFields: [],
    // --- new, additive fields (safe to ignore if caller doesn't use them) ---
    tagline: '',
    primaryColor: '',
    contactFormEndpoint: '',
    address: '',
    geo: { lat: null, lng: null },
    pagesCrawled: 0,
  }
}

/**
 * Run every "per-page" extractor against a single crawled page. Never
 * throws — a broken extractor just contributes empty data for that page.
 */
function extractFromPage(page) {
  const result = {
    phones: [],
    emails: [],
    whatsapp: '',
    socials: {},
    maps: '',
    bookingUrl: '',
  }
  if (!page?.$) return result

  const text = page.$.root().text() || ''

  try {
    result.phones = extractPhones({ $: page.$, text })
  } catch {
    /* never crash */
  }
  try {
    result.emails = extractEmails({ $: page.$, text })
  } catch {
    /* never crash */
  }
  try {
    result.whatsapp = extractWhatsApp({ $: page.$ })
  } catch {
    /* never crash */
  }
  try {
    const { socials, maps, bookingUrl } = extractSocials({ $: page.$ })
    result.socials = socials
    result.maps = maps
    result.bookingUrl = bookingUrl
  } catch {
    /* never crash */
  }

  return result
}

/**
 * Enrich a business website with contact details, socials, hours, schema
 * metadata, and branding/content signals. DO NOT change this function's
 * signature — the leads/enrich API route depends on it.
 *
 * @param {string} url
 * @returns {Promise<ReturnType<typeof emptyResult>>}
 */
export async function enrichWebsite(url) {
  const output = emptyResult()
  if (!url || typeof url !== 'string') return output

  try {
    const { homepage, allPages } = await crawlWebsite(url)

    if (!homepage) {
      // Website unreachable — return the empty shape untouched so callers
      // can safely spread it (existing behavior preserved).
      return output
    }

    output.pagesCrawled = allPages.length

    // ---- Schema.org (highest-trust structured data) ----
    let schema = {}
    try {
      schema = extractSchema(homepage.$)
      output.schema = schema.raw || {}
      if (schema.address) output.address = schema.address
      if (schema.geo) output.geo = schema.geo
    } catch {
      schema = {}
    }

    // ---- Per-page extraction, run in parallel across all crawled pages ----
    const perPageResults = await Promise.allSettled(
      allPages.map((page) => Promise.resolve(extractFromPage(page)))
    )
    const pageData = perPageResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)

    // ---- Merge phones/emails across pages + schema ----
    const schemaPhone = schema.telephone || ''
    const schemaEmail = schema.email || ''

    const allPhoneLists = pageData.map((p) => p.phones)
    if (schemaPhone) allPhoneLists.push([schemaPhone])
    output.phones = dedupeStrings(allPhoneLists.flat())

    const allEmailLists = pageData.map((p) => p.emails)
    if (schemaEmail) allEmailLists.push([schemaEmail])
    output.emails = dedupeStrings(allEmailLists.flat())

    // ---- WhatsApp: first non-empty match across pages ----
    output.whatsapp = pageData.find((p) => p.whatsapp)?.whatsapp || ''

    // ---- Socials / maps / booking: merge, first-found-wins per key ----
    const mergedSocials = {}
    let maps = ''
    let bookingUrl = ''
    for (const p of pageData) {
      for (const [platform, link] of Object.entries(p.socials || {})) {
        if (!mergedSocials[platform]) mergedSocials[platform] = link
      }
      if (!maps && p.maps) maps = p.maps
      if (!bookingUrl && p.bookingUrl) bookingUrl = p.bookingUrl
    }
    // schema.org sameAs often carries social links too
    for (const link of schema.sameAs || []) {
      for (const [platform, pattern] of Object.entries({
        instagram: /instagram\.com/i,
        facebook: /facebook\.com/i,
        linkedin: /linkedin\.com/i,
        twitter: /(twitter|x)\.com/i,
        youtube: /youtube\.com/i,
        tiktok: /tiktok\.com/i,
      })) {
        if (!mergedSocials[platform] && pattern.test(link)) mergedSocials[platform] = link
      }
    }
    output.socials = mergedSocials
    output.maps = maps
    output.bookingUrl = bookingUrl

    // ---- Hours: prefer schema, fall back to scanning pages ----
    try {
      let hours = extractHours({
        $: homepage.$,
        text: homepage.$.root().text() || '',
        schemaHours: schema.openingHours || {},
      })
      if (Object.keys(hours).length === 0) {
        for (const page of allPages.slice(1)) {
          const pageHours = extractHours({ $: page.$, text: page.$.root().text() || '' })
          if (Object.keys(pageHours).length > 0) {
            hours = pageHours
            break
          }
        }
      }
      output.hours = hours
    } catch {
      output.hours = {}
    }

    // ---- Business info / branding (primarily from homepage) ----
    try {
      const info = extractBusinessInfo({ $: homepage.$, baseUrl: homepage.url, schema })
      output.businessName = info.businessName
      output.tagline = info.tagline
      output.description = info.tagline || schema.description || ''
      output.primaryColor = info.primaryColor
      output.colors = info.colors
      output.logo = info.logo
      output.heroImage = info.heroImage
      output.services = info.services
      output.faq = info.faq
      output.testimonials = info.testimonials
      output.pricing = info.pricing
      output.contactFormEndpoint = info.contactFormEndpoint
    } catch {
      /* never crash — leave defaults */
    }

    // ---- Confidence, completeness, missing fields ----
    try {
      output.__websiteReachable = true
      const { confidence, completeness, missingFields } = computeConfidenceAndCompleteness(
        output,
        {
          phoneFromSchema: Boolean(schemaPhone),
          emailFromSchema: Boolean(schemaEmail),
          pagesCrawled: allPages.length,
        }
      )
      output.confidence = confidence
      output.completeness = completeness
      output.missingFields = missingFields
      delete output.__websiteReachable
    } catch {
      /* keep zeroed defaults */
    }

    return output
  } catch (e) {
    // Absolute last-resort guard: never let enrichment crash the caller.
    console.log('enrichWebsite fatal fallback:', e?.message)
    return output
  }
}

export default enrichWebsite