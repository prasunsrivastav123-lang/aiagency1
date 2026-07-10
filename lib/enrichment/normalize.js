/**
 * normalize.js
 * -----------------------------------------------------------------------
 * Small, dependency-free normalization helpers shared by every extractor.
 * Keeping these in one place means "what counts as a duplicate phone
 * number" or "how do we clean whitespace" is defined once.
 * -----------------------------------------------------------------------
 */

/** Collapse whitespace / newlines and trim. */
export function cleanText(str = '') {
  return String(str).replace(/\s+/g, ' ').trim()
}

/** Case + trailing-slash + protocol-insensitive de-dupe key for a URL. */
export function normalizeUrlKey(url = '') {
  try {
    const u = new URL(url)
    u.hash = ''
    let key = `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '')}${u.search}`
    return key.toLowerCase()
  } catch {
    return String(url).toLowerCase().trim()
  }
}

/** Resolve a possibly-relative href against a base URL. Returns null if invalid. */
export function resolveUrl(href, baseUrl) {
  if (!href) return null
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return null
  }
}

/** Dedupe an array of strings, case-insensitively, preserving first occurrence. */
export function dedupeStrings(arr = []) {
  const seen = new Set()
  const out = []
  for (const item of arr) {
    if (!item) continue
    const key = String(item).trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(String(item).trim())
  }
  return out
}

/**
 * Normalize a phone number to a comparable digit-only key while
 * preserving a human-readable display form.
 * Supports +91 (India), +1 (US/CA), +44 (UK), and generic international.
 */
export function normalizePhone(raw) {
  if (!raw) return null
  let cleaned = String(raw).replace(/[^\d+]/g, '')
  if (!cleaned) return null

  // Strip repeated leading + signs, keep only one.
  cleaned = cleaned.replace(/^\++/, '+')

  const digits = cleaned.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return null

  let display = cleaned
  if (!cleaned.startsWith('+')) {
    if (digits.length === 10) {
      // Ambiguous local number; assume India (+91) since that's the
      // primary target market, but keep raw digits as the dedupe key
      // so we don't falsely merge a US and Indian number.
      display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      display = `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
    } else {
      display = `+${digits}`
    }
  }

  return { display: display.trim(), key: digits }
}

/** Dedupe normalized phone objects by digit key, keep nicest display form. */
export function dedupePhones(phoneObjects = []) {
  const map = new Map()
  for (const p of phoneObjects) {
    if (!p?.key) continue
    if (!map.has(p.key)) map.set(p.key, p.display)
  }
  return Array.from(map.values())
}

/** Basic, permissive email validation after de-obfuscation. */
export function isLikelyEmail(str) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    str
  )
}

/** Filter out obvious placeholder / tracking-pixel / example emails. */
export function isJunkEmail(email) {
  const junkPatterns = [
    /^(email|name|you|user|test|example|sample)@/i,
    /@(example|domain|yourdomain|sentry|wixpress|godaddy)\./i,
    /\.(png|jpg|jpeg|gif|svg|webp)$/i,
    /^\d+@/, // pure numeric local part is almost always a false positive
  ]
  return junkPatterns.some((re) => re.test(email))
}