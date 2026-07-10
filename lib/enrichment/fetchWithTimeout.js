/**
 * fetchWithTimeout.js
 * -----------------------------------------------------------------------
 * Every network call in the enrichment engine goes through this helper so
 * we get ONE consistent place that enforces:
 *   - a hard timeout (default 10s per your spec)
 *   - a realistic browser User-Agent (many sites block bare Node fetches)
 *   - "never throw" semantics — callers get { ok:false } instead of a
 *     rejected promise, so a single bad page can never crash the pipeline.
 * -----------------------------------------------------------------------
 */

const DEFAULT_TIMEOUT_MS = 10_000

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AgencyOSBot/1.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

/**
 * Fetch a URL safely with a timeout. Never throws.
 * @param {string} url
 * @param {object} [options]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<{ ok:boolean, status?:number, url?:string, text?:string, error?:string }>}
 */
export async function safeFetch(url, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...(fetchOptions.headers || {}) },
      signal: controller.signal,
      redirect: 'follow',
      ...fetchOptions,
    })

    if (!res.ok) {
      return { ok: false, status: res.status, url: res.url || url, error: `HTTP ${res.status}` }
    }

    const contentType = res.headers.get('content-type') || ''
    // Guard against accidentally downloading huge binaries (images, PDFs, etc.)
    if (contentType && !contentType.includes('text') && !contentType.includes('html') && !contentType.includes('json') && !contentType.includes('xml')) {
      return { ok: false, status: res.status, url: res.url || url, error: `Unsupported content-type: ${contentType}` }
    }

    const text = await res.text()
    return { ok: true, status: res.status, url: res.url || url, text }
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? 'Timeout' : e?.message || 'Fetch failed' }
  } finally {
    clearTimeout(timer)
  }
}