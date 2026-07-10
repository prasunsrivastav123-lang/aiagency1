/**
 * extractHours.js
 * -----------------------------------------------------------------------
 * STEP 4 + STEP 9: extract business operating hours from:
 *   - schema.org JSON-LD `openingHoursSpecification` / `openingHours`
 *     (passed in pre-parsed from extractSchema.js, if available)
 *   - HTML tables (common "hours" table layout)
 *   - HTML lists (<ul>/<li> "Monday: 9am-5pm")
 *   - Free-text paragraphs mentioning day names + time ranges
 * -----------------------------------------------------------------------
 */

import { cleanText } from './normalize'

const DAY_NAMES = {
  monday: 'Monday',
  mon: 'Monday',
  tuesday: 'Tuesday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  wednesday: 'Wednesday',
  wed: 'Wednesday',
  thursday: 'Thursday',
  thu: 'Thursday',
  thurs: 'Thursday',
  friday: 'Friday',
  fri: 'Friday',
  saturday: 'Saturday',
  sat: 'Saturday',
  sunday: 'Sunday',
  sun: 'Sunday',
}

const DAY_ALTERNATION = Object.keys(DAY_NAMES).join('|')
// e.g. "Monday: 9:00 AM - 5:00 PM", "Mon-Fri 9am-6pm", "Sat 10 AM–2 PM"
const HOURS_LINE_REGEX = new RegExp(
  `\\b(${DAY_ALTERNATION})\\b[^\\d]{0,15}(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)\\s*[-–to]{1,3}\\s*(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)`,
  'gi'
)

function parseTextForHours(text) {
  const hours = {}
  let match
  const regex = new RegExp(HOURS_LINE_REGEX)
  while ((match = regex.exec(text)) !== null) {
    const [, dayRaw, open, close] = match
    const day = DAY_NAMES[dayRaw.toLowerCase()]
    if (day && !hours[day]) {
      hours[day] = `${open.trim()} - ${close.trim()}`
    }
  }
  return hours
}

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @param {string} params.text - plain visible text of the page
 * @param {Object} [params.schemaHours] - pre-parsed hours from JSON-LD, if any
 * @returns {Object<string,string>} e.g. { Monday: "9:00 AM - 5:00 PM", ... }
 */
export function extractHours({ $, text = '', schemaHours = {} }) {
  // Schema.org data is the most reliable source — prefer it.
  if (schemaHours && Object.keys(schemaHours).length > 0) {
    return schemaHours
  }

  let hours = {}

  try {
    if ($) {
      // Look for a dedicated hours table/section first (higher precision
      // than scanning the whole page).
      const hoursContainerSelectors = [
        '[class*="hours" i]',
        '[id*="hours" i]',
        'table',
      ]
      for (const selector of hoursContainerSelectors) {
        $(selector).each((_, el) => {
          const sectionText = cleanText($(el).text())
          const parsed = parseTextForHours(sectionText)
          hours = { ...parsed, ...hours } // don't overwrite already-found days
        })
        if (Object.keys(hours).length >= 3) break
      }
    }
  } catch {
    /* never crash */
  }

  if (Object.keys(hours).length === 0) {
    try {
      hours = parseTextForHours(cleanText(text))
    } catch {
      hours = {}
    }
  }

  return hours
}