import { CITIES } from "./cities";
import { CATEGORIES } from "./categories";

export function parseSearch(query) {

  const text = query.toLowerCase();

  let city = "";
  let category = "";

  for (const c of CITIES) {

    if (text.includes(c.toLowerCase())) {

      city = c;

      break;

    }

  }

  for (const c of CATEGORIES) {

    if (
      text.includes(c.toLowerCase()) ||
      text.includes(c.toLowerCase() + "s")
    ) {

      category = c;

      break;

    }

  }

  return {

    city,

    category,

    query

  };

}