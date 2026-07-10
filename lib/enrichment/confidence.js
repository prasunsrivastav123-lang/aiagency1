/**
 * confidence.js
 * -----------------------------------------------------------------------
 * STEP 11 + STEP 12 + STEP 13:
 *   - Per-field confidence scores (phone, email, website)
 *   - Overall completeness score (0-100)
 *   - missingFields list for CRM / sales-rep visibility
 * -----------------------------------------------------------------------
 */

// Weight of each field toward the overall completeness score. Sums to 100.
const COMPLETENESS_WEIGHTS = {
  phones: 15,
  emails: 15,
  whatsapp: 8,
  socials: 8,
  hours: 8,
  logo: 6,
  heroImage: 6,
  businessName: 8,
  description: 6,
  services: 6,
  faq: 4,
  testimonials: 4,
  pricing: 3,
  bookingUrl: 3,
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

/**
 * Confidence for a field group scales with how many independent sources
 * corroborated it (schema.org + page scrape + multiple pages), capped at
 * 100. A single weak text-regex match on one page scores lower than a
 * value confirmed by structured schema.org data.
 */
function scoreConfidence({ fromSchema, count, pagesFound }) {
  if (!count) return 0
  let score = 40 // baseline: found at all
  if (fromSchema) score += 35 // structured data is highly reliable
  score += Math.min(count - 1, 3) * 5 // multiple distinct values found
  score += Math.min(pagesFound - 1, 2) * 5 // corroborated across pages
  return Math.max(0, Math.min(100, score))
}

/**
 * @param {Object} enriched - the in-progress enrichment result object
 * @param {Object} sourceMeta - extra signal about *how* data was found
 * @param {boolean} sourceMeta.phoneFromSchema
 * @param {boolean} sourceMeta.emailFromSchema
 * @param {number} sourceMeta.pagesCrawled
 * @returns {{ confidence: {phone:number,email:number,website:number}, completeness:number, missingFields:string[] }}
 */
export function computeConfidenceAndCompleteness(enriched, sourceMeta = {}) {
  const { phoneFromSchema = false, emailFromSchema = false, pagesCrawled = 1 } = sourceMeta

  const confidence = {
    phone: scoreConfidence({
      fromSchema: phoneFromSchema,
      count: enriched.phones?.length || 0,
      pagesFound: pagesCrawled,
    }),
    email: scoreConfidence({
      fromSchema: emailFromSchema,
      count: enriched.emails?.length || 0,
      pagesFound: pagesCrawled,
    }),
    website: enriched.__websiteReachable ? 100 : 0,
  }

  let earned = 0
  let total = 0
  const missingFields = []

  for (const [field, weight] of Object.entries(COMPLETENESS_WEIGHTS)) {
    total += weight
    if (hasValue(enriched[field])) {
      earned += weight
    } else {
      missingFields.push(field)
    }
  }

  const completeness = total > 0 ? Math.round((earned / total) * 100) : 0

  return { confidence, completeness, missingFields }
}