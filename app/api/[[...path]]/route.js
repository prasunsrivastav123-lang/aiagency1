import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateLeads } from '@/lib/mock-leads'
import { callGemini } from '@/lib/gemini'

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
      const b = await request.json().catch(() => ({}))
      // Mock: pretend Google returned this user. In real integration, exchange code -> tokens -> userinfo.
      const email = (b.email || 'demo.google@agencyos.ai').toLowerCase()
      let user = await db.collection('users').findOne({ email })
      if (!user) {
        user = { id: uuidv4(), name: b.name || 'Demo Google User', email, role: 'sales', provider: 'google', createdAt: new Date() }
        await db.collection('users').insertOne(user)
      }
      const token = signToken(user)
      return ok({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, mocked: true })
    }

    if (route === '/auth/me' && method === 'GET') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      return ok({ user: t })
    }

    // ====== LEADS ======
    // POST /api/leads/search { city, category, filters }
    if (route === '/leads/search' && method === 'POST') {
      const b = await request.json()
      if (!b.city || !b.category) return err('city and category required')
      const leads = generateLeads(b.city, b.category, b.limit || 12)
      // Apply filters if any
      let filtered = leads
      if (b.filters?.noWebsite) filtered = filtered.filter(l => !l.website)
      if (b.filters?.minRating) filtered = filtered.filter(l => l.rating >= b.filters.minRating)
      return ok({ leads: filtered, count: filtered.length, source: 'mock' })
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

      const scored = await callGemini([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.4 })
      // Persist score
      await db.collection('lead_scores').updateOne(
        { businessId: biz.id },
        { $set: { businessId: biz.id, business: biz, score: scored, updatedAt: new Date() } },
        { upsert: true }
      )
      return ok(scored)
    }

    // GET /api/leads (saved to CRM)
    if (route === '/leads' && method === 'GET') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const rows = await db.collection('saved_leads').find({ userId: t.id }).sort({ createdAt: -1 }).limit(200).toArray()
      return ok({ leads: rows.map(strip) })
    }

    // POST /api/leads (save to CRM)
    if (route === '/leads' && method === 'POST') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const b = await request.json()
      const doc = { id: uuidv4(), userId: t.id, business: b.business, score: b.score || null, stage: 'new', notes: '', createdAt: new Date() }
      await db.collection('saved_leads').insertOne(doc)
      return ok(strip(doc))
    }

    // PATCH /api/leads/:id (update stage / notes)
    if (route.startsWith('/leads/') && method === 'PATCH') {
      const t = verifyToken(request); if (!t) return err('Unauthorized', 401)
      const id = route.split('/')[2]
      const b = await request.json()
      const upd = {}
      if (b.stage) upd.stage = b.stage
      if (b.notes !== undefined) upd.notes = b.notes
      await db.collection('saved_leads').updateOne({ id, userId: t.id }, { $set: upd })
      const row = await db.collection('saved_leads').findOne({ id })
      return ok(strip(row))
    }

    // ====== DEMO GENERATOR ======
    // POST /api/demo/generate { business }
    if (route === '/demo/generate' && method === 'POST') {
      const b = await request.json()
      const biz = b.business
      if (!biz?.name) return err('business.name required')

      const prompt = `You are a senior brand designer and copywriter. Generate a complete demo website for a real local business so that a sales agent can pitch: "Look, we already built you a preview!".

Business:
${JSON.stringify(biz, null, 2)}

Return ONLY strict JSON with this exact schema (no prose, no markdown):
{
  "brand": {
    "tagline": "<short tagline>",
    "primaryColor": "<hex color, e.g. #6D28D9>",
    "accentColor": "<hex color>",
    "vibe": "<one word: modern, warm, luxurious, energetic, minimal, playful>"
  },
  "hero": {
    "headline": "<punchy 6-10 words>",
    "subheadline": "<supporting sentence>",
    "ctaPrimary": "<button label>",
    "ctaSecondary": "<button label>"
  },
  "about": {
    "title": "<title>",
    "body": "<2-3 sentence description>"
  },
  "services": [
    { "title": "<service>", "description": "<1 sentence>", "icon": "<lucide-react icon name, e.g. Utensils, Scissors, Dumbbell>" }
  ],
  "features": [
    { "title": "<feature>", "description": "<1 sentence>" }
  ],
  "testimonials": [
    { "name": "<name>", "role": "<role or city>", "quote": "<quote>", "rating": 5 }
  ],
  "faq": [
    { "q": "<question>", "a": "<answer>" }
  ],
  "cta": {
    "headline": "<final push headline>",
    "button": "<button label>"
  },
  "contact": {
    "phone": "${biz.phone || ''}",
    "email": "${biz.email || ''}",
    "address": "${biz.address || ''}"
  }
}

Rules:
- Provide EXACTLY 4 services, 4 features, 3 testimonials, 5 faqs.
- Use lucide-react icon names only (Utensils, Coffee, Scissors, Dumbbell, HeartPulse, Home, Car, Sparkles, Star, Users, Clock, MapPin, Award, ShieldCheck, Phone).
- Match tone to the business category and vibe.`

      const demo = await callGemini([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.85 })
      const id = uuidv4()
      const doc = { id, business: biz, demo, createdAt: new Date() }
      await db.collection('demos').insertOne(doc)
      return ok({ id, demo, business: biz })
    }

    // GET /api/demo/:id
    if (route.startsWith('/demo/') && method === 'GET' && path[0] === 'demo' && path[1]) {
      const row = await db.collection('demos').findOne({ id: path[1] })
      if (!row) return err('Demo not found', 404)
      return ok(strip(row))
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
