/**
 * extractPhones.js
 * -----------------------------------------------------------------------
 * STEP 3 + STEP 6: extract every phone number from a page.
 * Supports +91, +1, +44, and generic international formats, sourced from:
 *   - tel: links (highest confidence)
 *   - visible text via regex (with international + local patterns)
 * Deduping is handled by normalizePhone()'s digit-only key.
 * -----------------------------------------------------------------------
 */

import { cleanText, normalizePhone, dedupePhones } from './normalize'

// Matches:
//  +91 98765 43210 | +919876543210 | +1 (415) 555-2671 | +44 20 7946 0958
//  0044 20 7946 0958 | (415) 555-2671 | 98765-43210
const PHONE_REGEX =
  /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?){1,4}\d{3,4}/g

const MIN_DIGITS = 7
const MAX_DIGITS = 15

function extractFromText(text) {
  const matches = text.match(PHONE_REGEX) || []
  const results = []
  for (const raw of matches) {
    const digitCount = (raw.match(/\d/g) || []).length
    if (digitCount < MIN_DIGITS || digitCount > MAX_DIGITS) continue
    // Skip things that are almost certainly not phone numbers: years,
    // long ID-like numbers with no separators and no leading +.
    if (!/[-.\s()+]/.test(raw) && digitCount > 10) continue
    results.push(raw)
  }
  return results
}

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @param {string} params.text - plain visible text of the page
 * @returns {string[]} deduped, human-readable phone numbers
 */
export function extractPhones({ $, text = '' }) {
  const rawCandidates = []

  try {
    if ($) {
      $('a[href^="tel:"]').each((_, el) => {
        const href = $(el).attr('href') || ''
        rawCandidates.push(href.replace(/^tel:/i, ''))
      })
    }
  } catch {
    /* never crash */
  }

  try {
    rawCandidates.push(...extractFromText(cleanText(text)))
  } catch {
    /* never crash */
  }

  const normalized = rawCandidates
    .map((raw) => normalizePhone(raw))
    .filter(Boolean)

  return dedupePhones(normalized)
}