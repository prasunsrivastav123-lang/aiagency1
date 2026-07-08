// ---------------------------------------------------------------------------
// MOCK LEAD DATA GENERATOR
// ---------------------------------------------------------------------------
// In production this file will be replaced by a real Google Places API call.
//
//   GET YOUR GOOGLE PLACES API KEY HERE:
//   https://console.cloud.google.com/apis/credentials  (enable "Places API (New)")
//
//   Real endpoint you will hit later:
//   https://places.googleapis.com/v1/places:searchText
//   Body: { textQuery: "<category> in <city>", languageCode: "en" }
//   Header: X-Goog-Api-Key: <YOUR_KEY>
// ---------------------------------------------------------------------------

const FIRST_NAMES = ['Sunset', 'Golden', 'Blue', 'Royal', 'Metro', 'Urban', 'Green', 'The', 'Casa', 'Villa', 'Studio', 'Modern', 'Classic', 'Prime', 'Elite']
const STREETS = ['Main St', 'Oak Ave', 'Market St', '5th Ave', 'Broadway', 'Park Rd', 'Sunset Blvd', 'Lake St', 'Cherry Ln', 'Union Sq']

const CATEGORY_SUFFIX = {
  restaurant: ['Bistro', 'Kitchen', 'Grill', 'Diner', 'Eatery', 'Cafe', 'Tavern', 'House'],
  cafe: ['Coffee', 'Espresso Bar', 'Roasters', 'Bakehouse', 'Cafe'],
  salon: ['Salon', 'Studio', 'Beauty Bar', 'Hair Lounge', 'Barbers'],
  gym: ['Fitness', 'Gym', 'Athletics', 'Crossfit', 'Health Club'],
  clinic: ['Clinic', 'Wellness Center', 'Medical Group', 'Health Center'],
  hospital: ['Hospital', 'Medical Center', 'Care Institute'],
  hotel: ['Hotel', 'Inn', 'Suites', 'Lodge', 'Boutique Hotel'],
  lawyer: ['Law Firm', 'Legal Group', 'Attorneys', 'Law Office'],
  dentist: ['Dental', 'Family Dentistry', 'Smile Studio', 'Dental Care'],
  jewellery: ['Jewellers', 'Fine Jewelry', 'Gold House', 'Diamond Co'],
  real_estate: ['Realty', 'Properties', 'Real Estate', 'Homes'],
  car_dealer: ['Motors', 'Auto', 'Cars', 'Autoplex'],
  school: ['Academy', 'School', 'Learning Center', 'Institute'],
  shop: ['Boutique', 'Store', 'Emporium', 'Market'],
}

function seeded(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff } }

export function generateLeads(city, category, limit = 12) {
  const cat = (category || 'restaurant').toLowerCase().replace(/\s+/g, '_')
  const suffixes = CATEGORY_SUFFIX[cat] || CATEGORY_SUFFIX.shop
  const rnd = seeded(`${city}-${cat}`)
  const leads = []
  for (let i = 0; i < limit; i++) {
    const first = FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)]
    const suffix = suffixes[Math.floor(rnd() * suffixes.length)]
    const name = `${first} ${suffix}`
    const streetNum = Math.floor(rnd() * 999) + 100
    const street = STREETS[Math.floor(rnd() * STREETS.length)]
    const rating = +(3.4 + rnd() * 1.6).toFixed(1)
    const reviewCount = Math.floor(rnd() * 480) + 12
    const hasWebsite = rnd() > 0.35
    const hasInsta = rnd() > 0.4
    const hasFacebook = rnd() > 0.3
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    leads.push({
      id: `${cat}-${city.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      name,
      category: cat,
      city,
      address: `${streetNum} ${street}, ${city}`,
      phone: `+1 (${Math.floor(rnd()*800)+200}) ${Math.floor(rnd()*900)+100}-${Math.floor(rnd()*9000)+1000}`,
      email: hasWebsite ? `hello@${slug}.com` : null,
      website: hasWebsite ? `https://${slug}.com` : null,
      rating,
      reviewCount,
      hasInstagram: hasInsta,
      hasFacebook,
      // AI Opportunity Score — pre-computed heuristic; real score comes from Gemini when user clicks "Score"
      opportunityScore: null,
      priceLevel: Math.floor(rnd() * 4) + 1,
      lat: 30 + rnd() * 15,
      lng: -100 + rnd() * 30,
    })
  }
  return leads
}

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
  { value: 'cafe', label: 'Cafes', emoji: '☕' },
  { value: 'salon', label: 'Salons & Barbers', emoji: '✂️' },
  { value: 'gym', label: 'Gyms & Fitness', emoji: '🏋️' },
  { value: 'clinic', label: 'Clinics', emoji: '🩺' },
  { value: 'hospital', label: 'Hospitals', emoji: '🏥' },
  { value: 'hotel', label: 'Hotels', emoji: '🏨' },
  { value: 'lawyer', label: 'Lawyers', emoji: '⚖️' },
  { value: 'dentist', label: 'Dentists', emoji: '🦷' },
  { value: 'jewellery', label: 'Jewellery', emoji: '💍' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { value: 'car_dealer', label: 'Car Dealers', emoji: '🚗' },
  { value: 'school', label: 'Schools', emoji: '🏫' },
  { value: 'shop', label: 'Shops', emoji: '🛍️' },
]
