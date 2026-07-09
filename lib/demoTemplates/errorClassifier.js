/**
 * /lib/demoTemplates/errorClassifier.js
 *
 * Decides whether a Gemini failure should silently trigger the fallback
 * flow (429 / quota / 500 / network / timeout / invalid JSON) or should
 * still surface as a real error (e.g. bad request from your own code,
 * auth misconfiguration — things a fallback can't paper over).
 */

const FALLBACK_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const FALLBACK_MESSAGE_PATTERNS = [
  /quota/i,
  /rate limit/i,
  /network/i,
  /timeout/i,
  /timed out/i,
  /econnreset/i,
  /econnrefused/i,
  /fetch failed/i,
  /invalid json/i,
  /unexpected token/i, // typical JSON.parse failure message
  /unexpected end of json input/i,
];

export function shouldTriggerFallback(error) {
  if (!error) return false;

  const status = error.status || error.statusCode || error?.response?.status;
  if (status && FALLBACK_STATUS_CODES.has(Number(status))) return true;

  const message = String(error.message || error);
  return FALLBACK_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

export default shouldTriggerFallback;