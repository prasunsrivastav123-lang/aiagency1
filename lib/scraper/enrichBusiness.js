import { fetchWebsite } from "./fetchWebsite";
import { extractPhone } from "./extractPhone";
import { extractEmail } from "./extractEmail";
import { extractSocials } from "./extractSocials";
import { extractWhatsapp } from "./extractWhatsapp";

export async function enrichBusiness(business) {
  if (!business?.website) {
    return {
      ...business,
      phone: business.phone || "",
      email: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    };
  }

  const html = await fetchWebsite(business.website);

  if (!html) {
    return {
      ...business,
      phone: business.phone || "",
      email: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    };
  }

  const socials = extractSocials(html);

  return {
    ...business,

    phone:
      business.phone ||
      extractPhone(html),

    email:
      extractEmail(html),

    instagram:
      socials.instagram,

    facebook:
      socials.facebook,

    linkedin:
      socials.linkedin,

    youtube:
      socials.youtube,

    whatsapp:
      extractWhatsapp(html),
  };
}