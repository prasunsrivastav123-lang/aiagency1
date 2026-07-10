/**
 * extractWhatsApp.js
 * -----------------------------------------------------------------------
 * STEP 3 + STEP 8: detect WhatsApp contact channels.
 * Recognizes:
 *   - wa.me/<number> links
 *   - api.whatsapp.com/send?phone=<number> links
 *   - whatsapp:// protocol links
 *   - floating WhatsApp buttons (common plugin classes / data attributes
 *     used by Elementor, WP WhatsApp Chat, Tidio, etc.)
 * -----------------------------------------------------------------------
 */

import { normalizePhone } from './normalize'

const WHATSAPP_LINK_PATTERNS = [
  /wa\.me\/(\+?\d{7,15})/i,
  /api\.whatsapp\.com\/send\?phone=(\+?\d{7,15})/i,
  /whatsapp:\/\/send\?phone=(\+?\d{7,15})/i,
  /chat\.whatsapp\.com\/(\+?\d{7,15})/i,
]

// Common selectors used by WhatsApp floating-button plugins/widgets.
const FLOATING_BUTTON_SELECTORS = [
  '[class*="whatsapp" i]',
  '[id*="whatsapp" i]',
  '[data-whatsapp]',
  '[class*="wa-chat" i]',
  '[class*="wa-widget" i]',
]

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @returns {string} a wa.me link if found, else ''
 */
export function extractWhatsApp({ $ }) {
  if (!$) return ''

  try {
    let found = null

    $('a[href]').each((_, el) => {
      if (found) return
      const href = $(el).attr('href') || ''
      for (const pattern of WHATSAPP_LINK_PATTERNS) {
        const m = href.match(pattern)
        if (m && m[1]) {
          found = m[1]
          return
        }
      }
    })

    if (!found) {
      for (const selector of FLOATING_BUTTON_SELECTORS) {
        if (found) break
        $(selector).each((_, el) => {
          if (found) return
          const attrs = $(el).attr() || {}
          const combined = Object.values(attrs).join(' ')
          for (const pattern of WHATSAPP_LINK_PATTERNS) {
            const m = combined.match(pattern)
            if (m && m[1]) {
              found = m[1]
              return
            }
          }
          // data-phone / data-number attributes on chat widgets
          const dataPhone = attrs['data-phone'] || attrs['data-number']
          if (dataPhone && /^\+?\d{7,15}$/.test(dataPhone.replace(/[\s-]/g, ''))) {
            found = dataPhone
          }
        })
      }
    }

    if (!found) return ''
    const normalized = normalizePhone(found)
    if (!normalized) return ''
    return `https://wa.me/${normalized.key}`
  } catch {
    return ''
  }
}