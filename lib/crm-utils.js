// Shared CRM helpers — pure functions, no API calls, no schema changes.

export function scoreTier(score = 0) {
  if (score >= 80) return { label: 'Excellent Lead', color: '#34d399', glow: 'rgba(52,211,153,0.45)' }
  if (score >= 55) return { label: 'Good Lead', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' }
  return { label: 'Cold Lead', color: '#f87171', glow: 'rgba(248,113,113,0.4)' }
}

export function estimateDealValue(score = 0) {
  if (score >= 80) return 120000
  if (score >= 55) return 40000
  return 15000
}

export function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export function priorityFromScore(score = 0) {
  if (score >= 80) return { label: 'High', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
  if (score >= 55) return { label: 'Medium', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
  return { label: 'Low', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' }
}

// Derives opportunity chips from whatever fields the lead/business object
// actually has. Never assumes a field exists — falls back gracefully so this
// works even before the backend adds new columns.
export function deriveOpportunityTags(lead) {
  const b = lead?.business || {}
  const tags = []

  if (!b.website) tags.push('No Website')
  if (!b.whatsapp && !b.phone) tags.push('No WhatsApp')
  if (b.rating && Number(b.rating) >= 4.3) tags.push('Google Reviews')
  if (b.reviewCount && Number(b.reviewCount) > 150) tags.push('High Traffic')
  if (b.instagram) tags.push('Instagram Active')
  if (b.facebook) tags.push('Facebook Active')
  if (!b.bookingLink) tags.push('No Booking')
  if (!b.onlineOrdering) tags.push('No Online Ordering')
  if (b.needsSeo) tags.push('Needs SEO')
  if (!b.chatbot) tags.push('Needs Chatbot')

  return tags.slice(0, 6)
}

export const TIMELINE_STAGES = [
  { key: 'created', label: 'Created' },
  { key: 'saved', label: 'Saved' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'demo', label: 'Demo Sent' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'closed', label: 'Closed' },
]

// Builds a best-effort timeline from whatever timestamps exist on the lead.
// Falls back to inferring completed steps from the current `stage`.
export function buildTimeline(lead) {
  const events = lead?.timeline || {}
  const stageOrder = ['new', 'contacted', 'demo', 'negotiation', 'won']
  const currentIdx = stageOrder.indexOf(lead?.stage || 'new')

  return TIMELINE_STAGES.map((t, i) => {
    const timestamp = events[t.key]
    const inferredDone =
      t.key === 'created' ||
      t.key === 'saved' ||
      (t.key === 'contacted' && currentIdx >= 1) ||
      (t.key === 'demo' && currentIdx >= 2) ||
      (t.key === 'meeting' && currentIdx >= 3) ||
      (t.key === 'closed' && (lead?.stage === 'won' || lead?.stage === 'lost'))

    return {
      ...t,
      done: Boolean(timestamp) || inferredDone,
      timestamp: timestamp || null,
    }
  })
}