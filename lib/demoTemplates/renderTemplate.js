/**
 * /lib/demoTemplates/renderTemplate.js
 *
 * renderTemplate(category, business) is the single entry point the
 * fallback system uses to generate a complete demo website with zero
 * API calls. It returns the SAME shape your Gemini flow returns today,
 * so the existing preview page, Deploy button, CRM integration, and
 * Save Demo flow all work unmodified.
 */

import categories, { categoryKeys } from "./categories";
import { buildPlaceholderMap, injectPlaceholders } from "./placeholders";

const ANIMATIONS = {
  heroEntrance: "fade-up",
  sectionReveal: "scroll-fade",
  cardHover: "lift-glow",
  buttonHover: "scale-bounce",
};

/**
 * Returns a lightweight list of categories for the fallback picker UI
 * (search bar + chip grid). Keeps payload small — no full template body.
 */
export function getCategoryList() {
  return categoryKeys.map((key) => ({
    key,
    label: categories[key].label,
    emoji: categories[key].emoji,
    primaryColor: categories[key].colors.primary,
    accentColor: categories[key].colors.accent,
  }));
}

export function isValidCategory(category) {
  return Boolean(category && categories[category]);
}

/**
 * Builds a complete demo website object for the given category and
 * business. Mirrors the Gemini-generated `demo` shape used elsewhere
 * in the app (brand, hero, about, services, features, testimonials,
 * faq, cta, contact) and extends it with navbar/gallery/footer/theme
 * so the preview page has everything a Gemini-built site would have.
 */
export function renderTemplate(category, business = {}) {
  const key = categories[category] ? category : "homeservices";
  const tpl = categories[key];
  const map = buildPlaceholderMap(business);

  const filled = injectPlaceholders(
    {
      hero: tpl.hero,
      about: tpl.about,
      services: tpl.services,
      features: tpl.features,
      gallery: tpl.gallery,
      testimonials: tpl.testimonials,
      faq: tpl.faq,
      cta: tpl.cta,
    },
    map
  );

  return {
    source: "local-template", // internal flag only — never surfaced in the UI
    category: key,
    categoryLabel: tpl.label,
    brand: {
      tagline: `Welcome to ${map.businessName}`,
      primaryColor: tpl.colors.primary,
      accentColor: tpl.colors.accent,
      darkColor: tpl.colors.dark,
      fontDisplay: tpl.fonts.display,
      fontBody: tpl.fonts.body,
      vibe: "premium",
    },
    navbar: {
      logoText: map.businessName,
      links: ["Home", "About", "Services", "Gallery", "Testimonials", "FAQ", "Contact"],
      ctaButton: filled.hero.ctaPrimary,
    },
    hero: filled.hero,
    about: filled.about,
    services: filled.services,
    features: filled.features,
    gallery: filled.gallery.map((label, i) => ({
      id: `gallery-${i + 1}`,
      label,
      // Frontend renders these as styled placeholder tiles using
      // brand colors — no external image calls required.
    })),
    testimonials: filled.testimonials,
    faq: filled.faq,
    cta: filled.cta,
    contact: {
      phone: map.phone,
      email: map.email,
      address: map.address,
      city: map.city,
      website: map.website,
      rating: map.rating,
      reviews: map.reviews,
    },
    footer: {
      businessName: map.businessName,
      tagline: filled.hero.subheadline,
      links: ["Home", "About", "Services", "Contact"],
      copyright: `© ${new Date().getFullYear()} ${map.businessName}. All rights reserved.`,
    },
    animations: ANIMATIONS,
  };
}

export default renderTemplate;