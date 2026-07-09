export function extractWhatsapp(html) {

  if (!html) return "";

  const match =
    html.match(/https?:\/\/wa\.me\/[0-9]+/i) ||
    html.match(/https?:\/\/api\.whatsapp\.com\/send[^\s"'<>]+/i);

  return match ? match[0] : "";

}