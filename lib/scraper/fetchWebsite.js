import axios from "axios";

export async function fetchWebsite(url) {
  if (!url) return null;

  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const res = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137 Safari/537.36",
      },
    });

    return res.data;
  } catch (err) {
    console.log("Website fetch failed:", url);
    return null;
  }
}