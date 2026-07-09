export function parseSearch(query) {
  const q = query.toLowerCase();

  const result = {
    city: "",
    category: "",
    filters: {
      noWebsite: false,
      hasPhone: false,
    },
    limit: 20,
  };

  const cities = [
    "kushinagar",
    "delhi",
    "durgapur",
    "lucknow",
    "mumbai",
    "kolkata",
    "bangalore",
    "noida",
    "goa",
    "agra",
    "kanpur",
    "patna",
    "pune",
    "hyderabad",
    "chennai",
  ];

  for (const city of cities) {
    if (q.includes(city)) {
      result.city =
        city.charAt(0).toUpperCase() +
        city.slice(1);
      break;
    }
  }

  const categories = {
    restaurant: [
      "restaurant",
      "restaurants",
      "food",
      "eatery",
    ],

    gym: [
      "gym",
      "gyms",
      "fitness",
    ],

    hotel: [
      "hotel",
      "hotels",
    ],

    dentist: [
      "dentist",
      "dentists",
    ],

    hospital: [
      "hospital",
      "hospitals",
    ],

    salon: [
      "salon",
      "salons",
      "beauty",
    ],

    pharmacy: [
      "pharmacy",
      "medical",
    ],

    school: [
      "school",
      "schools",
    ],

    cafe: [
      "cafe",
      "coffee",
    ],
  };

  for (const key in categories) {
    for (const word of categories[key]) {
      if (q.includes(word)) {
        result.category = key;
        break;
      }
    }
  }

  if (q.includes("no website"))
    result.filters.noWebsite = true;

  if (q.includes("phone"))
    result.filters.hasPhone = true;

  return result;
}