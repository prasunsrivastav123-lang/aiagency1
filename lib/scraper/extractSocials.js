export function extractSocials(html) {

  return {

    instagram:
      html.match(/https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/i)?.[0] || "",

    facebook:
      html.match(/https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/i)?.[0] || "",

    linkedin:
      html.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/i)?.[0] || "",

    youtube:
      html.match(/https?:\/\/(www\.)?youtube\.com\/[^\s"'<>]+/i)?.[0] || ""

  };

}