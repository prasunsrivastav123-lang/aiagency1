/**
 * /lib/demoTemplates/placeholders.js
 *
 * Recursively walks any JS value (string, array, object) and replaces
 * {{placeholder}} tokens with real business data. Missing values fall
 * back to sensible defaults so the rendered site never shows "undefined"
 * or a raw {{token}}.
 */

const DEFAULTS = {
  businessName: "Your Business",
  phone: "Contact us for details",
  email: "",
  address: "",
  city: "your city",
  website: "",
  category: "business",
  rating: "4.8",
  reviews: "120+",
};

/**
 * Builds the map of placeholder -> value from a business object.
 * Accepts flexible field names since the business record may come
 * from different sources (CRM, form input, scraped lead data, etc).
 */
export function buildPlaceholderMap(business = {}) {
  const b = business || {};
  return {
    businessName: b.name || b.businessName || DEFAULTS.businessName,
    phone: b.phone || b.phoneNumber || DEFAULTS.phone,
    email: b.email || DEFAULTS.email,
    address: b.address || b.fullAddress || DEFAULTS.address,
    city: b.city || (b.address ? b.address.split(",").slice(-2, -1)[0]?.trim() : "") || DEFAULTS.city,
    website: b.website || "",
    category: b.category || b.categoryLabel || DEFAULTS.category,
    rating: b.rating != null ? String(b.rating) : DEFAULTS.rating,
    reviews: b.reviews != null ? String(b.reviews) : DEFAULTS.reviews,
  };
}

/**
 * Replaces every {{token}} occurrence in a string using the provided map.
 * Unknown tokens are left as a graceful blank rather than crashing.
 */
function replaceInString(str, map) {
  return str.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, token) => {
    if (token in map) return map[token];
    return "";
  });
}

/**
 * Deep-clones and replaces placeholders across strings, arrays, and
 * nested objects. Non-string primitives pass through untouched.
 */
export function injectPlaceholders(value, map) {
  if (typeof value === "string") {
    return replaceInString(value, map);
  }
  if (Array.isArray(value)) {
    return value.map((item) => injectPlaceholders(item, map));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = injectPlaceholders(value[key], map);
    }
    return out;
  }
  return value;
}

export default injectPlaceholders;