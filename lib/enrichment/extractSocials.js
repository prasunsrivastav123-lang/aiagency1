/**
 * extractSocials.js
 * -----------------------------------------------------------------------
 * STEP 3 + STEP 10: extract social profile links, plus (STEP 3) Google
 * Maps links and booking/Calendly links, since they're discovered the
 * same way (scanning all <a href>).
 * -----------------------------------------------------------------------
 */

const SOCIAL_PATTERNS = {
  instagram: /instagram\.com\/([a-zA-Z0-9._-]+)/i,
  facebook: /facebook\.com\/([a-zA-Z0-9.\-_/]+)/i,
  linkedin: /linkedin\.com\/(company|in)\/([a-zA-Z0-9\-_]+)/i,
  twitter: /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i,
  youtube: /youtube\.com\/(channel|c|user|@)?\/?([a-zA-Z0-9\-_]+)/i,
  tiktok: /tiktok\.com\/@?([a-zA-Z0-9._-]+)/i,
  telegram: /t\.me\/([a-zA-Z0-9_]+)/i,
  pinterest: /pinterest\.[a-z.]+\/([a-zA-Z0-9\-_]+)/i,
  threads: /threads\.net\/@?([a-zA-Z0-9._-]+)/i,
}

const MAPS_PATTERN = /(maps\.google\.[a-z.]+|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)/i
const BOOKING_PATTERNS = [
  /calendly\.com\/[a-zA-Z0-9\-_/]+/i,
  /cal\.com\/[a-zA-Z0-9\-_/]+/i,
  // Match "booking"/"book" only as its own hostname label (e.g.
  // booking.example.com, book.example.com) — NOT as a substring, so this
  // never false-matches domains like facebook.com.
  /(^|\/\/)(www\.)?book(ing)?\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i,
  /appointlet\.com\/[a-zA-Z0-9\-_/]+/i,
  /setmore\.com\/[a-zA-Z0-9\-_/]+/i,
]

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @returns {{ socials: Object<string,string>, maps: string, bookingUrl: string }}
 */
export function extractSocials({ $ }) {
  const socials = {}
  let maps = ''
  let bookingUrl = ''

  if (!$) return { socials, maps, bookingUrl }

  try {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      if (!href || href.startsWith('#')) return

      for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
        if (!socials[platform] && pattern.test(href)) {
          socials[platform] = href
        }
      }

      if (!maps && MAPS_PATTERN.test(href)) {
        maps = href
      }

      if (!bookingUrl) {
        for (const pattern of BOOKING_PATTERNS) {
          if (pattern.test(href)) {
            bookingUrl = href
            break
          }
        }
      }
    })
  } catch {
    /* never crash */
  }

  return { socials, maps, bookingUrl }
}