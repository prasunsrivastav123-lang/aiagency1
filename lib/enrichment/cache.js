/**
 * cache.js
 * -----------------------------------------------------------------------
 * Lightweight in-memory cache + in-flight request de-duplication.
 *
 * Why this exists:
 *  - Crawling a site can touch several pages (home, /contact, /about, ...).
 *  - Multiple leads can share the same domain within a scoring session.
 *  - Without caching we'd re-download the same URL repeatedly, wasting
 *    time and risking rate limits / bans from target sites.
 *
 * This module is intentionally dependency-free and process-local. If you
 * later move to a multi-instance deployment, swap the Map for Redis
 * without touching any other enrichment file (same get/set/has API).
 * -----------------------------------------------------------------------
 */

const DEFAULT_TTL_MS = 1000 * 60 * 30 // 30 minutes

class TTLCache {
  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs
    this.store = new Map()
  }

  get(key) {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key, value, ttlMs = this.ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
    return value
  }

  has(key) {
    return this.get(key) !== undefined
  }

  delete(key) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}

// Cache of already-fetched page bodies keyed by normalized URL.
export const pageCache = new TTLCache(DEFAULT_TTL_MS)

// Tracks in-flight fetch promises so concurrent calls for the same URL
// share one network request instead of firing duplicates.
const inflight = new Map()

/**
 * dedupeFetch - ensures only one network request is ever in flight for a
 * given key at a time. Any concurrent callers await the same promise.
 *
 * @param {string} key - unique cache/request key (usually the URL)
 * @param {() => Promise<any>} fn - the actual fetch/work function
 * @returns {Promise<any>}
 */
export async function dedupeFetch(key, fn) {
  const cached = pageCache.get(key)
  if (cached !== undefined) return cached

  if (inflight.has(key)) {
    return inflight.get(key)
  }

  const promise = (async () => {
    try {
      const result = await fn()
      pageCache.set(key, result)
      return result
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}