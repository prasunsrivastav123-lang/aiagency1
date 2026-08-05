// lib/calling/analytics/index.js
//
// Frontend-only analytics helpers. These operate on the array of calls
// returned by GET /api/calls (or any subset of it) — no network calls here.
// They exist mainly as local/derived fallbacks and for components that want
// finer-grained slices than /api/calls/stats returns in bulk.

const MEETING_STATUSES = ['meeting-booked']
const COMPLETED_STATUSES = ['completed', 'interested', 'meeting-booked']

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d
}

function toDate(call) {
  return call?.createdAt ? new Date(call.createdAt) : null
}

/** % of total calls that resulted in a booked meeting */
export function calculateConversion(calls = []) {
  if (!calls.length) return 0
  const meetings = calls.filter((c) => MEETING_STATUSES.includes(c.status)).length
  return Math.round((meetings / calls.length) * 100)
}

/** Average call duration (seconds) across calls that recorded a duration */
export function calculateAverageDuration(calls = []) {
  const durations = calls.filter((c) => c.duration > 0).map((c) => c.duration)
  if (!durations.length) return 0
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

/** Number of calls created today */
export function calculateTodayCalls(calls = []) {
  const since = startOfToday()
  return calls.filter((c) => {
    const d = toDate(c)
    return d && d >= since
  }).length
}

/** Number of calls created in the last 7 days */
export function calculateWeeklyCalls(calls = []) {
  const since = startOfWeek()
  return calls.filter((c) => {
    const d = toDate(c)
    return d && d >= since
  }).length
}

/** Number of calls completed today (completed/interested/meeting-booked) */
export function calculateCompletedToday(calls = []) {
  const since = startOfToday()
  return calls.filter((c) => {
    const d = toDate(c)
    return d && d >= since && COMPLETED_STATUSES.includes(c.status)
  }).length
}

/** Format seconds as m:ss for display */
export function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

export default {
  calculateConversion,
  calculateAverageDuration,
  calculateTodayCalls,
  calculateWeeklyCalls,
  calculateCompletedToday,
  formatDuration,
}
