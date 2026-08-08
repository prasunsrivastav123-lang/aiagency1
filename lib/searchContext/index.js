const HISTORY_KEY = 'agencyos_search_history'
const LEAD_MAP_KEY = 'agencyos_lead_search_map'
const MAX_SEARCHES = 50

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function write(key, value) {
  if (typeof window === 'undefined') return false
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}

function hash(value) {
  let result = 0
  for (let i = 0; i < value.length; i += 1) result = ((result << 5) - result + value.charCodeAt(i)) | 0
  return Math.abs(result).toString(36).slice(0, 5)
}

export function recordSearch(query, filters = {}) {
  try {
    const cleanQuery = String(query || '').trim()
    if (!cleanQuery) return null
    const timestamp = Date.now()
    const entry = { searchId: `s_${timestamp}_${hash(`${cleanQuery}${timestamp}`)}`, query: cleanQuery, filters, timestamp }
    const history = read(HISTORY_KEY, []).filter((item) => item?.searchId !== entry.searchId)
    write(HISTORY_KEY, [...history, entry].slice(-MAX_SEARCHES))
    return entry
  } catch { return null }
}

export function tagLead(leadId, searchId) {
  try {
    if (!leadId || !searchId) return
    write(LEAD_MAP_KEY, { ...read(LEAD_MAP_KEY, {}), [String(leadId)]: searchId })
  } catch {}
}

export function getSearchForLead(leadId) {
  try {
    if (!leadId) return null
    const searchId = read(LEAD_MAP_KEY, {})[String(leadId)]
    return read(HISTORY_KEY, []).find((item) => item?.searchId === searchId) || null
  } catch { return null }
}

export function getSearchById(searchId) {
  try { return read(HISTORY_KEY, []).find((item) => item?.searchId === searchId) || null } catch { return null }
}

export function getRecentSearches(limit = 6) {
  try { return read(HISTORY_KEY, []).slice(-Math.max(0, limit)).reverse() } catch { return [] }
}
