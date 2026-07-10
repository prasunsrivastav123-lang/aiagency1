/**
 * extractSchema.js
 * -----------------------------------------------------------------------
 * STEP 4: parse JSON-LD schema.org business metadata.
 * Handles Organization, LocalBusiness, Restaurant, Store, Gym/ExerciseGym,
 * Hospital, Physician/Doctor, and generic @graph / array-wrapped payloads.
 * -----------------------------------------------------------------------
 */

const BUSINESS_TYPES = new Set([
  'organization',
  'localbusiness',
  'restaurant',
  'store',
  'gym',
  'exercisegym',
  'healthclub',
  'hospital',
  'physician',
  'doctor',
  'medicalbusiness',
  'dentist',
  'foodestablishment',
  'cafeorcoffeeshop',
  'hotel',
  'lodgingbusiness',
  'school',
  'educationalorganization',
])

function flattenGraph(node, out) {
  if (!node) return
  if (Array.isArray(node)) {
    node.forEach((n) => flattenGraph(n, out))
    return
  }
  if (typeof node !== 'object') return
  if (node['@graph']) {
    flattenGraph(node['@graph'], out)
    return
  }
  out.push(node)
}

function isBusinessType(type) {
  if (!type) return false
  const types = Array.isArray(type) ? type : [type]
  return types.some((t) => BUSINESS_TYPES.has(String(t).toLowerCase()))
}

function parseOpeningHours(spec) {
  if (!spec) return {}
  const specs = Array.isArray(spec) ? spec : [spec]
  const hours = {}

  for (const s of specs) {
    // String form: "Mo-Fr 09:00-17:00" or "Mo,Tu,We 09:00-17:00"
    if (typeof s === 'string') {
      const m = s.match(/([A-Za-z,\-]+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/)
      if (m) {
        hours[s] = `${m[2]} - ${m[3]}`
      }
      continue
    }
    // Structured OpeningHoursSpecification
    const days = s.dayOfWeek
      ? (Array.isArray(s.dayOfWeek) ? s.dayOfWeek : [s.dayOfWeek])
      : []
    const opens = s.opens
    const closes = s.closes
    for (const day of days) {
      const dayName = String(day).split('/').pop() // "https://schema.org/Monday" -> "Monday"
      if (dayName && opens && closes) {
        hours[dayName] = `${opens} - ${closes}`
      }
    }
  }

  return hours
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{
 *   name: string, description: string, logo: string, image: string,
 *   telephone: string, email: string, address: string,
 *   geo: { lat: number|null, lng: number|null },
 *   openingHours: Object<string,string>, sameAs: string[], raw: Object|null
 * }}
 */
export function extractSchema($) {
  const empty = {
    name: '',
    description: '',
    logo: '',
    image: '',
    telephone: '',
    email: '',
    address: '',
    geo: { lat: null, lng: null },
    openingHours: {},
    sameAs: [],
    raw: null,
  }

  if (!$) return empty

  try {
    const nodes = []
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).contents().text()
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        flattenGraph(parsed, nodes)
      } catch {
        // malformed JSON-LD is common in the wild; skip silently
      }
    })

    const businessNode = nodes.find((n) => isBusinessType(n['@type'])) || nodes[0]
    if (!businessNode) return empty

    const address = businessNode.address
      ? typeof businessNode.address === 'string'
        ? businessNode.address
        : [
            businessNode.address.streetAddress,
            businessNode.address.addressLocality,
            businessNode.address.addressRegion,
            businessNode.address.postalCode,
            businessNode.address.addressCountry,
          ]
            .filter(Boolean)
            .join(', ')
      : ''

    const geo = businessNode.geo
      ? {
          lat: parseFloat(businessNode.geo.latitude) || null,
          lng: parseFloat(businessNode.geo.longitude) || null,
        }
      : { lat: null, lng: null }

    const logo =
      typeof businessNode.logo === 'string'
        ? businessNode.logo
        : businessNode.logo?.url || ''

    const image =
      typeof businessNode.image === 'string'
        ? businessNode.image
        : Array.isArray(businessNode.image)
        ? businessNode.image[0]
        : businessNode.image?.url || ''

    return {
      name: businessNode.name || '',
      description: businessNode.description || '',
      logo,
      image,
      telephone: businessNode.telephone || '',
      email: businessNode.email || '',
      address,
      geo,
      openingHours: parseOpeningHours(
        businessNode.openingHoursSpecification || businessNode.openingHours
      ),
      sameAs: Array.isArray(businessNode.sameAs)
        ? businessNode.sameAs
        : businessNode.sameAs
        ? [businessNode.sameAs]
        : [],
      raw: businessNode,
    }
  } catch {
    return empty
  }
}