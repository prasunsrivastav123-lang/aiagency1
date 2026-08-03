// =====================================================
// WhatsApp Automation — Mock Data
// lib/whatsapp/index.js
//
// Centralized mock data for the WhatsApp dashboard.
// Swap these for real API calls (GET /api/whatsapp/campaigns, etc.)
// once the backend endpoints exist — components never hardcode
// data themselves, they only import from here.
// =====================================================

/**
 * @typedef {"draft" | "running" | "paused" | "completed"} CampaignStatus
 */

/**
 * @typedef {Object} Campaign
 * @property {string} id
 * @property {string} name
 * @property {CampaignStatus} status
 * @property {string} audience
 * @property {number} audienceSize
 * @property {number} sent
 * @property {number} replies
 * @property {string} message
 * @property {string} template
 * @property {string} createdAt
 */

export const campaigns = [
  {
    id: "camp_1",
    name: "Restaurant Owners — Mumbai",
    status: "running",
    audience: "No-website restaurants",
    audienceSize: 128,
    sent: 94,
    replies: 21,
    message:
      "Hi {{name}} 👋\n\nI created a FREE website demo for {{business}}. Would you like to see it?",
    template: "agency_intro",
    createdAt: "2026-07-28T09:15:00Z",
  },
  {
    id: "camp_2",
    name: "Salons & Spas — Delhi NCR",
    status: "completed",
    audience: "Salons with < 4.2 rating",
    audienceSize: 76,
    sent: 76,
    replies: 18,
    message:
      "Hi {{name}} 👋\n\nMost salons like {{business}} are losing bookings to no-shows. I built a free demo that fixes that. Want a look?",
    template: "agency_intro",
    createdAt: "2026-07-20T11:40:00Z",
  },
  {
    id: "camp_3",
    name: "Dentists — Bengaluru",
    status: "paused",
    audience: "Dentists, no website",
    audienceSize: 54,
    sent: 30,
    replies: 4,
    message:
      "Hi {{name}} 👋\n\n{{business}} could be getting more appointment requests online. I put together a free demo — interested?",
    template: "agency_intro",
    createdAt: "2026-07-15T08:05:00Z",
  },
  {
    id: "camp_4",
    name: "Gyms — Pune (Draft)",
    status: "draft",
    audience: "Fitness studios",
    audienceSize: 41,
    sent: 0,
    replies: 0,
    message:
      "Hi {{name}} 👋\n\nI built a free website + WhatsApp booking demo for {{business}}. Want to check it out?",
    template: "agency_intro",
    createdAt: "2026-08-01T14:22:00Z",
  },
  {
    id: "camp_5",
    name: "Hotels — Goa",
    status: "running",
    audience: "Boutique hotels",
    audienceSize: 39,
    sent: 22,
    replies: 9,
    message:
      "Hi {{name}} 👋\n\nGuests booking {{business}} directly instead of through OTAs — I can show you how with a free demo.",
    template: "agency_intro",
    createdAt: "2026-07-30T16:50:00Z",
  },
]

/**
 * Aggregate stats for the top of the dashboard.
 * In production this should come from GET /api/whatsapp/stats.
 */
export const stats = {
  campaigns: campaigns.length,
  messagesSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
  replies: campaigns.reduce((sum, c) => sum + c.replies, 0),
  get conversionRate() {
    const sent = this.messagesSent
    return sent === 0 ? 0 : Math.round((this.replies / sent) * 1000) / 10
  },
}

/**
 * Recent message activity, newest first — powers timeline views.
 */
export const recentMessages = [
  {
    id: "msg_1",
    campaignId: "camp_1",
    to: "Rahul Restaurant",
    phone: "+91 98765 43210",
    status: "delivered",
    sentAt: "2026-08-03T08:12:00Z",
  },
  {
    id: "msg_2",
    campaignId: "camp_1",
    to: "Spice Route Kitchen",
    phone: "+91 91234 56780",
    status: "read",
    sentAt: "2026-08-03T07:58:00Z",
  },
  {
    id: "msg_3",
    campaignId: "camp_5",
    to: "Casa Del Sol",
    phone: "+91 90000 11122",
    status: "replied",
    sentAt: "2026-08-02T18:30:00Z",
  },
  {
    id: "msg_4",
    campaignId: "camp_3",
    to: "Smile Care Dental",
    phone: "+91 99887 76655",
    status: "delivered",
    sentAt: "2026-08-02T12:05:00Z",
  },
]

/** Status → badge color tokens, kept in one place for consistency. */
export const statusStyles = {
  running: {
    label: "Running",
    dot: "bg-emerald-400",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  completed: {
    label: "Completed",
    dot: "bg-blue-400",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  paused: {
    label: "Paused",
    dot: "bg-amber-400",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  draft: {
    label: "Draft",
    dot: "bg-zinc-400",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
}

export function getCampaignById(id) {
  return campaigns.find((c) => c.id === id) || null
}