import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { callGemini } from '@/lib/gemini'
import bcrypt from 'bcryptjs'
import { parseSearch } from "@/lib/search-parser";
import { OAuth2Client } from 'google-auth-library'
import { enrichWebsite } from "@/lib/enrichment";
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/callback/google'
)

// ---------- MongoDB ----------
let client, db
async function getDb() {
  if (!db) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// ---------- Helpers ----------
function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}
function ok(data, status = 200) { return cors(NextResponse.json(data, { status })) }
function err(msg, status = 400) { return cors(NextResponse.json({ error: msg }, { status })) }

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || 'sales' }, process.env.JWT_SECRET, { expiresIn: '30d' })
}
function verifyToken(request) {
  const h = request.headers.get('authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return null
  try { return jwt.verify(token, process.env.JWT_SECRET) } catch { return null }
}
function strip(doc) { if (!doc) return doc; const { _id, ...rest } = doc; return rest }

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

async function handle(request, { params }) {
  const { path = [] } = await params
  const route = '/' + path.join('/')
  const method = request.method

  try {
    const db = await getDb()

    // ====== HEALTH ======
    if (route === '/' && method === 'GET') return ok({ ok: true, service: 'AgencyOS AI' })

    // ====== AUTH ======
    if (route === '/auth/register' && method === 'POST') {
      const b = await request.json()
      if (!b.email || !b.password || !b.name) return err('name, email, password required')
      const exists = await db.collection('users').findOne({ email: b.email.toLowerCase() })
      if (exists) return err('Email already registered', 409)
      const user = {
        id: uuidv4(),
        name: b.name,
        email: b.email.toLowerCase(),
        passwordHash: await bcrypt.hash(b.password, 10),
        role: 'sales',
        provider: 'email',
        createdAt: new Date(),
      }
      await db.collection('users').insertOne(user)
      const token = signToken(user)
      return ok({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    }

    if (route === '/auth/login' && method === 'POST') {
      const b = await request.json()
      const user = await db.collection('users').findOne({ email: (b.email || '').toLowerCase() })
      if (!user) return err('Invalid credentials', 401)
      const okPw = await bcrypt.compare(b.password || '', user.passwordHash || '')
      if (!okPw) return err('Invalid credentials', 401)
      const token = signToken(user)
      return ok({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    }

    // ---- GOOGLE OAUTH (MOCK) ----
    // TODO: Replace with real Google OAuth handshake.
    //   GET YOUR CLIENT ID HERE: https://console.cloud.google.com/apis/credentials
    //   Recommended library: `next-auth` with GoogleProvider
    //   Callback URL you must register: {NEXT_PUBLIC_BASE_URL}/api/auth/callback/google
if (route === '/auth/google' && method === 'POST') {

  const body = await request.json()

  if (!body.credential)
    return err("Missing Google credential")

  const ticket =
    await googleClient.verifyIdToken({

      idToken: body.credential,

      audience: process.env.GOOGLE_CLIENT_ID

    })

  const payload = ticket.getPayload()

  if (!payload)
    return err("Invalid Google token")

  const email =
    payload.email.toLowerCase()

  let user =
    await db.collection("users").findOne({

      email

    })

  if (!user) {

    user = {

      id: uuidv4(),

      name: payload.name,

      email,

      picture: payload.picture,

      provider: "google",

      role: "sales",

      createdAt: new Date()

    }

    await db.collection("users").insertOne(user)

  }

  const token =
    signToken(user)

  return ok({

    token,

    user: {

      id: user.id,

      name: user.name,

      email: user.email,

      picture: user.picture,

      role: user.role

    }

  })

}

    if (route === '/auth/me' && method === 'GET') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      return ok({ user: t })
    }

    // ====== LEADS ======
    // POST /api/leads/search { city, category, filters }
// ====== LEADS ======
// POST /api/leads/search
if (route === "/search/ai" && method === "POST") {

  const body = await request.json();

  const parsed = parseSearch(body.query || "");

  if (!parsed.city)
    return err("Please enter a city.");

  if (!parsed.category)
    return err("Please enter a business category.");

  return ok(parsed);
}
// ====== LEADS ======
if (route === '/leads/search' && method === 'POST') {
  const b = await request.json()

  if (!b.city || !b.category)
    return err("city and category required")

  // Smart category mapping
  const categoryMap = {
    restaurant: [
      "catering.restaurant",
      "catering.fast_food",
      "catering.cafe"
    ],

    cafe: [
      "catering.cafe"
    ],

    hotel: [
      "accommodation.hotel"
    ],

    gym: [
      "sport.fitness"
    ],

    salon: [
      "service.beauty",
      "service.hairdresser"
    ],

    dentist: [
      "healthcare.dentist"
    ],

    hospital: [
      "healthcare.hospital"
    ],

    pharmacy: [
      "healthcare.pharmacy"
    ],

    supermarket: [
      "commercial.supermarket"
    ],

    school: [
      "education.school"
    ]
  }

const key = b.category
  .toLowerCase()
  .trim()
  .replace(/s$/, "");
const selected =
  categoryMap[key] || ["commercial"];

console.log("Category:", b.category);
console.log("Mapped:", selected);

  // ------------------------
  // Get city coordinates
  // ------------------------

  const geo = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      b.city
    )}&limit=1&apiKey=${process.env.GEOAPIFY_API_KEY}`
  )

  const geoData = await geo.json()

  if (!geoData.features?.length)
    return err("City not found")

  const [lon, lat] =
    geoData.features[0].geometry.coordinates

  // ------------------------
  // Search businesses
  // ------------------------

  let leads = []

  for (const category of selected) {

    const url =
      `https://api.geoapify.com/v2/places?` +
      `categories=${category}` +
      `&filter=circle:${lon},${lat},10000` +
      `&limit=20` +
      `&apiKey=${process.env.GEOAPIFY_API_KEY}`

    const res = await fetch(url)

    const data = await res.json()

    const businesses =
      (data.features || []).map(place => ({

        id: place.properties.place_id,

        name:
          place.properties.name ||
          "Unknown Business",

        address:
          place.properties.formatted || "",

        phone:
          place.properties.phone ||
          null,

        website:
          place.properties.website ||
          null,

        email:
          place.properties.email ||
          null,

        city: b.city,

        category: b.category,

        lat:
          place.properties.lat,

        lng:
          place.properties.lon,

        rating: 0,

        reviewCount: 0,

        source: "Geoapify"

      }))

    leads.push(...businesses)
  }

  // Remove duplicates

  const unique =
    Array.from(
      new Map(
        leads.map(l => [l.id, l])
      ).values()
    )

  let filtered = unique

  if (b.filters?.noWebsite)
    filtered =
      filtered.filter(
        l => !l.website
      )

  if (b.filters?.hasPhone)
    filtered =
      filtered.filter(
        l => l.phone
      )

  return ok({

    leads: filtered,

    count: filtered.length,

    source: "geoapify"

  })
}
// ======================================
// SAVE LEAD
// POST /api/leads
// ======================================

if (route === "/leads" && method === "POST") {

    const t = verifyToken(request);

    if (!t)
        return err("Unauthorized",401);

    const body = await request.json();

    await db.collection("saved_leads").insertOne({

        id: uuidv4(),

        userId: t.id,

        business: body.business,

        score: body.score,

        createdAt: new Date(),

    });

    return ok({

        success:true

    });

}

// =====================================================
// LEAD ENRICHMENT
// POST /api/leads/enrich
// =====================================================

if (route === "/leads/enrich" && method === "POST") {

  const business = await request.json();

  let websiteData = null;

  if (business.website) {
    try {
      websiteData = await enrichWebsite(business.website);
    } catch (e) {
      console.log("Website enrichment failed:", e.message);
    }
  }

 const enriched = {

  ...business,

  // Primary contact
  phone: websiteData?.phones?.[0] || business.phone || "",
  email: websiteData?.emails?.[0] || business.email || "",

  // Complete contact info
  phones: websiteData?.phones || [],
  emails: websiteData?.emails || [],
  whatsapp: websiteData?.whatsapp || "",

  // Socials
  socials: websiteData?.socials || {},

  // Business
  businessName: websiteData?.businessName || business.name || "",
  description: websiteData?.description || "",
  tagline: websiteData?.tagline || "",

  // Branding
  logo: websiteData?.logo || "",
  heroImage: websiteData?.heroImage || "",
  colors: websiteData?.colors || [],
  primaryColor: websiteData?.primaryColor || "",

  // Content
  services: websiteData?.services || [],
  faq: websiteData?.faq || [],
  testimonials: websiteData?.testimonials || [],
  pricing: websiteData?.pricing || [],

  // Business details
  hours: websiteData?.hours || {},
  address: websiteData?.address || business.address || "",
  geo: websiteData?.geo || {},

  // Links
  bookingUrl: websiteData?.bookingUrl || "",
  maps: websiteData?.maps || business.maps || "",
  contactFormEndpoint: websiteData?.contactFormEndpoint || "",

  // Schema
  schema: websiteData?.schema || {},

  // AI scores
  confidence: websiteData?.confidence || {
    phone: 0,
    email: 0,
    website: 0,
  },

  completeness: websiteData?.completeness || 0,

  missingFields: websiteData?.missingFields || [],

  pagesCrawled: websiteData?.pagesCrawled || 0,

};

  return ok(enriched);

}
    // POST /api/leads/score { business }
    if (route === '/leads/score' && method === 'POST') {
      const b = await request.json()
      const biz = b.business
      if (!biz?.name) return err('business.name required')

      const prompt = `You are an expert web agency consultant analyzing whether a local business is a good sales lead for us (we sell modern websites + AI automation).

Analyze this business and produce an AI Opportunity Score from 0-100 (higher = better lead).

Business data:
${JSON.stringify(biz, null, 2)}

Consider:
- Does it have a modern website? (No website = huge opportunity)
- Rating & review count (high engagement but no digital presence is best)
- Social media presence
- Category (some categories benefit more from AI/booking/chatbot)
- Perceived business size and revenue potential

Return ONLY strict JSON with this exact schema (no prose, no markdown):
{
  "score": <integer 0-100>,
  "verdict": "<one of: cold, warm, hot, on-fire>",
  "summary": "<1-2 sentences why this is or isn't a good lead>",
  "breakdown": {
    "digitalPresence": <0-100>,
    "businessSignal": <0-100>,
    "aiFit": <0-100>,
    "reachability": <0-100>
  },
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "pitchAngle": "<one-sentence sales angle we should lead with>"
}`

    let scored;

try {

  scored = await callGemini(
    [
      {
        role: "user",
        content: prompt,
      },
    ],
    {
      jsonMode: true,
      temperature: 0.4,
        maxOutputTokens:300
    }
  );

} catch (e) {

    console.log("Gemini unavailable");

    const localScore =
        (!biz.website ? 40 : 0) +
        (biz.phone ? 15 : 0) +
        (biz.category ? 15 : 0) +
        (biz.address ? 15 : 0) +
        15;

    return ok({

        score: Math.min(localScore,100),

        verdict:"warm",

        summary:"Generated locally because Gemini is unavailable.",

        breakdown:{
            digitalPresence:!biz.website?90:40,
            businessSignal:70,
            aiFit:80,
            reachability:biz.phone?90:40
        },

        opportunities:[
            "Professional Website",
            "WhatsApp Automation",
            "Google Business Optimization"
        ],

        pitchAngle:
            "Show a free demo website to increase conversions."

    });

}

return ok(scored);
    }
// ======================================
// GET LEADS
// ======================================

if (route === "/leads" && method === "GET") {

    const t = verifyToken(request);

    if (!t)
        return err("Unauthorized",401);

    const leads =
        await db
        .collection("saved_leads")
        .find({ userId:t.id })
        .sort({createdAt:-1})
        .toArray();

    return ok({

        leads:leads.map(strip)

    });

}
// =====================================================
// OUTREACH GENERATOR
// POST /api/outreach/generate
// =====================================================

if (route === "/outreach/generate" && method === "POST") {

  const t = verifyToken(request)

  if (!t)
    return err("Unauthorized",401)

  const body = await request.json()

  const business = body.business

  if (!business?.id)
    return err("Business ID required")

  const cached =
    await db.collection("outreachs")
    .findOne({
      leadId:business.id
    })

  if (cached && !body.force) {

    return ok({
      ...cached,
      cached:true
    })

  }

  const prompt = `

You are a professional sales copywriter.

Generate:

Email

WhatsApp

Call Script

Proposal

Follow Up

Business:

${JSON.stringify(business,null,2)}

Return STRICT JSON.

`

 let result;

try {

  result = await callGemini(
    [
      {
        role: "user",
        content: prompt,
      },
    ],
    {
      jsonMode: true,
    }
  );

} catch (e) {

  console.log("Gemini unavailable, using local outreach");

  result = {

    emailSubject:
      `Grow ${business.name} with a modern website`,

    emailBody:
`Hi ${business.name},

I noticed your business and thought you could benefit from a modern website along with AI-powered customer support.

I'd love to show you a free demo built specifically for your business.

Would you be available for a quick 10-minute call this week?

Regards,
AgencyOS AI`,

    whatsapp:
`Hi! I created a free website demo for ${business.name}. It could help attract more customers and automate enquiries. Would you like to see it?`,

    callScript: {

      opening:
        "Hi, am I speaking with the owner?",

      painPoints: [
        "Limited online presence",
        "Missed online customers",
        "No automated enquiry system",
      ],

      pitch:
        "We build modern websites with AI automation to increase bookings.",

      questions: [
        "Do customers usually call or visit directly?",
        "Do you currently have a website?",
      ],

      objectionHandling: [
        {
          objection: "Too expensive",
          response: "We have affordable plans for local businesses.",
        },
      ],

      closing:
        "Can I show you a free demo this week?",

    },

    followUp: {

      day2:
        "Just checking if you saw my previous message.",

      day5:
        "We recently built another demo for a similar business.",

      day10:
        "Would love to know your thoughts.",

      final:
        "I'll close this conversation for now. Feel free to reach out anytime.",

    },

    proposalIntro: {

      intro:
        "Digital Growth Proposal",

      problem:
        "Limited digital presence.",

      solution:
        "Professional website with AI chatbot and WhatsApp integration.",

      benefits: [
        "More customers",
        "24/7 AI replies",
        "Better Google visibility",
      ],

      services: [
        "Website",
        "AI Chatbot",
        "WhatsApp Automation",
      ],

      timeline:
        "5 Days",

      price:
        "₹19,999",

      estimatedROI:
        "350%",

    },

  };

}

  await db.collection("outreachs")
  .updateOne(

    {
      leadId:business.id
    },

    {
      $set:{
        leadId:business.id,
        ...result,
        updatedAt:new Date()
      },

      $setOnInsert:{
        createdAt:new Date()
      }

    },

    {
      upsert:true
    }

  )

  return ok({

    ...result,

    cached:false

  })

}

// =====================================================
// GENERATE DEMO
// POST /api/demo/generate
// =====================================================

if (route === "/demo/generate" && method === "POST") {

    const body = await request.json();

    const biz = body.business;

    if (!biz?.name)
        return err("business.name required");

    const prompt = `
Generate a modern website for this business.

Business:
${JSON.stringify(biz, null, 2)}

Return STRICT JSON only.
`;

    try {

        const demo = await callGemini(
            [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            {
                jsonMode: true,
                temperature: 0.8,
            }
        );

        return ok(demo);

    } catch (e) {

        console.log("Gemini unavailable");

        return ok({
            fallbackRequired: true,
            business: biz,
        });

    }

}
// =====================================================
// SAVE LOCAL DEMO
// POST /api/demo/save-local
// =====================================================

if (route === "/demo/save-local" && method === "POST") {

  const body = await request.json();

  if (!body.business)
    return err("Business required");

  if (!body.demo)
    return err("Demo required");

  const id = uuidv4();

  await db.collection("demos").insertOne({

    id,

    business: body.business,

    demo: body.demo,

    source: "template",

    createdAt: new Date(),

  });

  return ok({

    id,

    business: body.business,

    demo: body.demo,

  });

}

    // GET /api/demo/:id
    if (route.startsWith('/demo/') && method === 'GET' && path[0] === 'demo' && path[1]) {
      const row = await db.collection('demos').findOne({ id: path[1] })
      if (!row) return err('Demo not found', 404)
      return ok(strip(row))
    }

    // =====================================================
// CONTACT FORM
// POST /api/contact
// =====================================================

if (route === "/contact" && method === "POST") {

    const body = await request.json();

    if (!body.businessId)
        return err("Business ID required");

    if (!body.name)
        return err("Name required");

    await db.collection("contactLeads").insertOne({

        businessId: body.businessId,

        name: body.name,

        phone: body.phone || "",

        email: body.email || "",

        message: body.message || "",

        createdAt: new Date(),

    });

    return ok({

        success: true,

        message: "Contact request saved."

    });

}

    // ====== DEPLOYMENTS (MOCK) ======
    // TODO: Real deployment flow.
    //   1) Create GitHub repo:
    //      GET YOUR GITHUB PAT HERE: https://github.com/settings/tokens?type=beta
    //      POST https://api.github.com/user/repos { name, private: true }
    //      Then create files (README, index.html) via PUT /repos/{owner}/{repo}/contents/{path}
    //   2) Trigger Vercel deploy:
    //      GET YOUR VERCEL TOKEN HERE: https://vercel.com/account/tokens
    //      POST https://api.vercel.com/v13/deployments with { name, gitSource: { type: 'github', repo, ref: 'main' } }
    //   3) Poll deployment.url until READY.
    if (route === '/deployments' && method === 'POST') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const b = await request.json()
      const slug = (b.business?.name || 'demo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const doc = {
        id: uuidv4(),
        userId: t.id,
        demoId: b.demoId || null,
        business: b.business || null,
        status: 'building',
        repoUrl: `https://github.com/agencyos-demos/${slug}`,
        liveUrl: `https://demo-${slug}.vercel.app`,
        createdAt: new Date(),
      }
      await db.collection('deployments').insertOne(doc)
      // Simulate completing after a short time (MOCK)
      setTimeout(async () => {
        try { await db.collection('deployments').updateOne({ id: doc.id }, { $set: { status: 'ready', readyAt: new Date() } }) } catch (e) {}
      }, 2500)
      return ok(strip(doc))
    }

    if (route === '/deployments' && method === 'GET') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const rows = await db.collection('deployments').find({ userId: t.id }).sort({ createdAt: -1 }).limit(100).toArray()
      return ok({ deployments: rows.map(strip) })
    }

    // =====================================================
// SEND EMAIL
// =====================================================

if(route==="/outreach/send-email" && method==="POST"){

    const t=verifyToken(request)

    if(!t)
      return err("Unauthorized",401)

    return ok({

      success:true,

      message:"Email sending coming next."

    })

}

    // ====== WHATSAPP OUTREACH (MOCK) ======
    // TODO: Real WhatsApp Business API.
    //   GET YOUR ACCESS TOKEN HERE: https://developers.facebook.com/apps (WhatsApp product)
    //   POST https://graph.facebook.com/v20.0/{phone-number-id}/messages
    //   Only pre-approved templates can be sent for outbound outreach.
    if (route === '/whatsapp/send' && method === 'POST') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const b = await request.json()
      const doc = { id: uuidv4(), userId: t.id, to: b.to, template: b.template || 'agency_intro', variables: b.variables || {}, status: 'queued', mocked: true, createdAt: new Date() }
      await db.collection('whatsapp_messages').insertOne(doc)
      return ok(strip(doc))
    }

    // ====== STATS ======
    if (route === '/stats' && method === 'GET') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const [leadsSaved, demos, deployments, hotLeads] = await Promise.all([
        db.collection('saved_leads').countDocuments({ userId: t.id }),
        db.collection('demos').countDocuments({}),
        db.collection('deployments').countDocuments({ userId: t.id }),
        db.collection('saved_leads').countDocuments({ userId: t.id, 'score.score': { $gte: 70 } }),
      ])
      // 14-day mini trend (mock, would come from real activity)
      const days = Array.from({ length: 14 }, (_, i) => ({
        day: i + 1,
        leads: Math.round(3 + Math.sin(i / 2) * 3 + i * 0.6),
        messages: Math.round(2 + Math.cos(i / 3) * 4 + i * 0.4),
      }))
      return ok({ leadsSaved, demos, deployments, hotLeads, trend: days })
    }

    return err(`Route ${route} not found`, 404)
  } catch (e) {
    console.error('API Error:', e)
    return err(e.message || 'Internal server error', 500)
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
