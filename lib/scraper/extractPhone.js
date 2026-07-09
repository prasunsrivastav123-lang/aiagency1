export function extractPhone(html) {
  if (!html) return "";

  const regex =
    /(\+?\d{1,3}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}/g;

  const matches = html.match(regex);

  if (!matches) return "";

  return matches[0].trim();
}