export function createWhatsAppLink(phone, message) {
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, "");

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}