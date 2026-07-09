// lib/opportunity-score.js
// Feature 3: AI Opportunity Score — NO Gemini, works offline/instantly,
// unaffected by Gemini quota.

export function calculateOpportunity(business) {
  const reasons = []
  let score = 0

  const hasWebsite = !!business?.website
  const hasPhone = !!business?.phone
  const rating =
    typeof business?.rating === 'number'
      ? business.rating
      : parseFloat(business?.rating) || 0
  const reviewCount =
    typeof business?.reviewCount === 'number'
      ? business.reviewCount
      : parseInt(business?.reviewCount, 10) || 0
  const hasSocial = !!(
    business?.hasInstagram ||
    business?.hasFacebook ||
    business?.socialMedia
  )
  const hasHours = !!(business?.openingHours || business?.hours)
  const category = (business?.category || '').toString().toLowerCase()

  if (!hasWebsite) {
    score += 40
    reasons.push('No website')
  }
  if (!hasPhone) {
    score += 15
    reasons.push('No phone')
  }
  if (rating > 0 && rating < 4) {
    score += 10
    reasons.push('Low rating')
  }
  if (reviewCount < 20) {
    score += 10
    reasons.push('Low review count')
  }
  if (!hasSocial) {
    score += 10
    reasons.push('No social media')
  }
  if (!hasHours) {
    score += 5
    reasons.push('No opening hours listed')
  }

  const highDemand = ['restaurant', 'salon', 'gym', 'dentist']
  if (highDemand.some(k => category.includes(k))) {
    score += 5
    reasons.push('High-demand category')
  }

  score = Math.max(0, Math.min(100, score))

  return { score, reasons }
}