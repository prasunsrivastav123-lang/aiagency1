/**
 * extractBusinessInfo.js
 * -----------------------------------------------------------------------
 * STEP 5: extract higher-level business/branding content that goes beyond
 * simple contact-detail scraping:
 *   - Business name, tagline
 *   - Primary brand color
 *   - Logo + hero image
 *   - Services list
 *   - FAQs
 *   - Testimonials
 *   - Pricing
 *   - Contact form endpoint (the `action` of the page's contact <form>)
 *
 * All heuristics degrade gracefully — if a signal isn't found, we simply
 * return an empty value rather than guessing, since incorrect data is
 * worse than missing data for a sales pipeline.
 * -----------------------------------------------------------------------
 */

import { cleanText, resolveUrl } from './normalize'

function getMeta($, ...names) {
  for (const name of names) {
    const val =
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content')
    if (val) return val.trim()
  }
  return ''
}

function extractBusinessName($, schemaName) {
  if (schemaName) return schemaName
  const ogSiteName = getMeta($, 'og:site_name')
  if (ogSiteName) return ogSiteName
  const ogTitle = getMeta($, 'og:title')
  if (ogTitle) return cleanText(ogTitle).split(/[-|–]/)[0].trim()
  const title = cleanText($('title').first().text())
  if (title) return title.split(/[-|–]/)[0].trim()
  return ''
}

function extractTagline($, schemaDescription) {
  const ogDesc = getMeta($, 'og:description', 'description')
  if (ogDesc) return cleanText(ogDesc)
  if (schemaDescription) return cleanText(schemaDescription)
  return ''
}

function extractPrimaryColor($) {
  const themeColor = $('meta[name="theme-color"]').attr('content')
  if (themeColor) return themeColor.trim()

  // Fallback: scan inline <style> blocks for a CSS custom property that
  // looks like a brand color variable.
  let color = ''
  $('style').each((_, el) => {
    if (color) return
    const css = $(el).contents().text() || ''
    const match = css.match(
      /--(?:primary|brand|theme|accent)[a-zA-Z-]*\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/
    )
    if (match) color = match[1]
  })
  return color
}

function extractLogo($, baseUrl, schemaLogo) {
  if (schemaLogo) return resolveUrl(schemaLogo, baseUrl) || schemaLogo

  const ogImage = getMeta($, 'og:image')
  const candidates = [
    $('img[class*="logo" i]').first().attr('src'),
    $('img[alt*="logo" i]').first().attr('src'),
    $('img[id*="logo" i]').first().attr('src'),
    $('link[rel="icon"]').attr('href'),
    $('link[rel="shortcut icon"]').attr('href'),
  ].filter(Boolean)

  const first = candidates[0] || ''
  const resolved = resolveUrl(first, baseUrl)
  if (resolved) return resolved
  if (ogImage) return resolveUrl(ogImage, baseUrl) || ogImage
  return ''
}

function extractHeroImage($, baseUrl, schemaImage) {
  const ogImage = getMeta($, 'og:image')
  if (ogImage) return resolveUrl(ogImage, baseUrl) || ogImage
  if (schemaImage) return resolveUrl(schemaImage, baseUrl) || schemaImage

  let hero = ''
  $('img').each((_, el) => {
    if (hero) return
    const src = $(el).attr('src') || $(el).attr('data-src')
    const width = parseInt($(el).attr('width') || '0', 10)
    if (src && width >= 600) hero = src
  })
  const resolved = resolveUrl(hero, baseUrl)
  return resolved || hero
}

function extractServices($) {
  const services = []
  const containers = $('[class*="service" i], [id*="service" i]')
  containers.find('h1,h2,h3,h4,li').each((_, el) => {
    const t = cleanText($(el).text())
    if (t && t.length > 2 && t.length < 80) services.push(t)
  })
  return Array.from(new Set(services)).slice(0, 20)
}

function extractFaq($) {
  const faqs = []

  // Prefer schema.org FAQPage mainEntity if present in JSON-LD.
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text() || '{}')
      const entities = Array.isArray(parsed) ? parsed : [parsed]
      for (const node of entities) {
        if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
          for (const q of node.mainEntity) {
            faqs.push({
              question: cleanText(q.name || ''),
              answer: cleanText(q.acceptedAnswer?.text || ''),
            })
          }
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  })

  if (faqs.length > 0) return faqs.slice(0, 20)

  // Fallback: heuristically scan for FAQ-like containers.
  $('[class*="faq" i], [id*="faq" i]').each((_, container) => {
    $(container)
      .find('h2,h3,h4,summary,dt')
      .each((_, qEl) => {
        const question = cleanText($(qEl).text())
        const answer = cleanText($(qEl).next().text())
        if (question && question.endsWith('?')) {
          faqs.push({ question, answer })
        }
      })
  })

  return faqs.slice(0, 20)
}

function extractTestimonials($) {
  const testimonials = []
  $('[class*="testimonial" i], [class*="review" i], [id*="testimonial" i]').each(
    (_, el) => {
      const t = cleanText($(el).text())
      if (t && t.length > 15 && t.length < 500) testimonials.push(t)
    }
  )
  return Array.from(new Set(testimonials)).slice(0, 10)
}

function extractPricing($) {
  const pricing = []
  const CURRENCY_REGEX = /[$₹€£]\s?\d[\d,]*(\.\d{1,2})?/

  $('[class*="pric" i], [id*="pric" i]').each((_, container) => {
    const t = cleanText($(container).text())
    if (CURRENCY_REGEX.test(t) && t.length < 200) pricing.push(t)
  })

  return Array.from(new Set(pricing)).slice(0, 10)
}

function extractContactFormEndpoint($, baseUrl) {
  let endpoint = ''
  $('form').each((_, el) => {
    if (endpoint) return
    const action = $(el).attr('action')
    const html = ($.html($(el)) || '').toLowerCase()
    const looksLikeContactForm =
      /contact|enquiry|inquiry|message|get in touch/.test(html) || !action
    if (action && looksLikeContactForm) {
      endpoint = resolveUrl(action, baseUrl) || action
    }
  })
  return endpoint
}

/**
 * @param {Object} params
 * @param {import('cheerio').CheerioAPI} params.$
 * @param {string} params.baseUrl
 * @param {Object} [params.schema] - output of extractSchema()
 * @returns {{
 *   businessName:string, tagline:string, primaryColor:string, colors:string[],
 *   logo:string, heroImage:string, services:string[], faq:Array,
 *   testimonials:string[], pricing:string[], contactFormEndpoint:string
 * }}
 */
export function extractBusinessInfo({ $, baseUrl, schema = {} }) {
  const empty = {
    businessName: '',
    tagline: '',
    primaryColor: '',
    colors: [],
    logo: '',
    heroImage: '',
    services: [],
    faq: [],
    testimonials: [],
    pricing: [],
    contactFormEndpoint: '',
  }

  if (!$) return empty

  try {
    const businessName = extractBusinessName($, schema.name)
    const tagline = extractTagline($, schema.description)
    const primaryColor = extractPrimaryColor($)
    const logo = extractLogo($, baseUrl, schema.logo)
    const heroImage = extractHeroImage($, baseUrl, schema.image)
    const services = extractServices($)
    const faq = extractFaq($)
    const testimonials = extractTestimonials($)
    const pricing = extractPricing($)
    const contactFormEndpoint = extractContactFormEndpoint($, baseUrl)

    return {
      businessName,
      tagline,
      primaryColor,
      colors: primaryColor ? [primaryColor] : [],
      logo,
      heroImage,
      services,
      faq,
      testimonials,
      pricing,
      contactFormEndpoint,
    }
  } catch {
    return empty
  }
}