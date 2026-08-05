// lib/calling/index.js
//
// Central API wrapper for the AI Calling module.
// This file is the ONLY place that talks to the backend for calling data.
// It consumes the existing, already-implemented endpoints exactly as documented:
//
//   POST   /api/calls
//   PATCH  /api/calls
//   GET    /api/calls
//   POST   /api/calls/script
//   POST   /api/calls/note
//   POST   /api/calls/followup
//   POST   /api/calls/schedule
//   GET    /api/calls/stats
//
// No routes, payload shapes, or response shapes are altered here — this is a
// thin, typed-in-spirit fetch layer plus a couple of read-only helpers for
// pulling saved leads into the queue (GET /api/leads already exists and is
// not modified in any way by this file).

const BASE = '/api'

function getToken() {
  if (typeof window === 'undefined') return null
  return (
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('authToken') ||
    null
  )
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch (e) {
    data = null
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

// ---------- Calls ----------

/** GET /api/calls — call history for the current user */
export async function getCalls() {
  const data = await request('/calls', { method: 'GET' })
  return data?.calls || []
}

/** POST /api/calls — create a call record (start of call) */
export async function createCall(payload) {
  return request('/calls', { method: 'POST', body: payload })
}

/** PATCH /api/calls — update an existing call (status/duration/notes/etc) */
export async function updateCall(payload) {
  if (!payload?.id) throw new Error('updateCall requires an id')
  return request('/calls', { method: 'PATCH', body: payload })
}

/** GET /api/calls/stats — dashboard stats for the calling module */
export async function getStats() {
  return request('/calls/stats', { method: 'GET' })
}

/** POST /api/calls/script — generate an AI call script for a lead */
export async function generateScript(business, opts = {}) {
  return request('/calls/script', {
    method: 'POST',
    body: { business, ...opts },
  })
}

/** POST /api/calls/note — save call notes (optionally generate an AI summary) */
export async function saveNotes({ callId, notes, generateSummary = false }) {
  if (!callId) throw new Error('saveNotes requires a callId')
  return request('/calls/note', {
    method: 'POST',
    body: { callId, notes, generateSummary },
  })
}

/** POST /api/calls/followup — record an outcome + timeline entry + reminder */
export async function followup({ callId, outcome, note, nextActionAt }) {
  if (!callId) throw new Error('followup requires a callId')
  if (!outcome) throw new Error('followup requires an outcome')
  return request('/calls/followup', {
    method: 'POST',
    body: { callId, outcome, note, nextActionAt },
  })
}

/** POST /api/calls/schedule — schedule a future call */
export async function scheduleCall(payload) {
  if (!payload?.date || !payload?.time) {
    throw new Error('scheduleCall requires date and time')
  }
  return request('/calls/schedule', { method: 'POST', body: payload })
}

// ---------- Leads (read-only, feeds the queue) ----------
// GET /api/leads is an existing, unmodified endpoint from the Leads module.
// We only read from it here to populate the calling queue with saved leads.

/** GET /api/leads — saved leads (used to populate the call queue) */
export async function getSavedLeads() {
  try {
    const data = await request('/leads', { method: 'GET' })
    return data?.leads || []
  } catch (e) {
    // If the caller isn't authorized yet or the leads module is unavailable,
    // fail soft — the queue will just render from call history instead.
    return []
  }
}

const callingApi = {
  getCalls,
  createCall,
  updateCall,
  getStats,
  generateScript,
  saveNotes,
  followup,
  scheduleCall,
  getSavedLeads,
}

export default callingApi