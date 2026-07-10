/**
 * extractEmails.js
 * -----------------------------------------------------------------------
 * STEP 3 + STEP 7: extract every email address from a page.
 * Supports:
 *   - mailto: links (highest confidence)
 *   - plain text emails
 *   - common obfuscation patterns:
 *       "name [at] domain [dot] com"
 *       "name (at) domain (dot) com"
 *       "name AT domain DOT com"
 *       "name&#64;domain&#46;com" (HTML entity encoded, handled by cheerio
 *        already decoding entities in .text())
 * -----------------------------------------------------------------------
 */

import { cleanText, isLikelyEmail, isJunkEmail, dedupeStrings } from './normalize'

const PLAIN_EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

// e.g. "info [at] example [dot] com", "info (at) example (dot) com", "info AT example DOT com"
const OBFUSCATED_EMAIL_REGEX =
  /([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\{at\}|\s+at\s+|@\s*)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\{dot\}|\s+dot\s+|\.)\s*([a-zA-Z]{2,})/gi

function deobfuscate(text) {
  const found = []
  let match
  const regex = new RegExp(OBFUSCATED_EMAIL_REGEX)
  while ((match = regex.exec(text)) !== null) {
    const [, user, domain, tld] = match
    found.push(`${user}@${domain}.${tld}`)
  }
  return found
}

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @param {string} params.text - plain visible text of the page
 * @returns {string[]} deduped, valid, non-junk email addresses
 */
export function extractEmails({ $, text = '' }) {
  const candidates = []

  try {
    if ($) {
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href') || ''
        const addr = href.replace(/^mailto:/i, '').split('?')[0]
        candidates.push(addr)
      })
    }
  } catch {
    /* never crash */
  }

  const cleaned = cleanText(text)

  try {
    candidates.push(...(cleaned.match(PLAIN_EMAIL_REGEX) || []))
  } catch {
    /* never crash */
  }

  try {
    candidates.push(...deobfuscate(cleaned))
  } catch {
    /* never crash */
  }

  const valid = candidates
    .map((e) => decodeURIComponent(String(e).trim().toLowerCase()))
    .filter((e) => isLikelyEmail(e) && !isJunkEmail(e))

  return dedupeStrings(valid)
}