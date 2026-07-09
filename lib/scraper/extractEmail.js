export function extractEmail(html) {
  if (!html) return "";

  const regex =
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

  const match = html.match(regex);

  return match ? match[0] : "";
}