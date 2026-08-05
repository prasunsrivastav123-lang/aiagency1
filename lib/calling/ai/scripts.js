// lib/calling/ai/scripts.js
//
// Thin helper around POST /api/calls/script. Kept separate from
// lib/calling/index.js so components that only need script generation
// (e.g. IncomingLeadCard) don't need to import the full API surface.

import { generateScript as callScriptEndpoint } from '@/lib/calling/index'

/**
 * generateAIScript(lead, opts)
 * lead: the business/lead object (business, owner, website, rating, category...)
 * opts: { tone: 'professional' | 'friendly', language: 'english' | 'hindi', callId }
 *
 * Calls POST /api/calls/script and returns the script object exactly as the
 * backend returns it. The backend already falls back locally if Gemini
 * fails, so this never throws for generation failures — only for network
 * failures, which callers should handle with a toast/inline message.
 */
export async function generateAIScript(lead, opts = {}) {
  const script = await callScriptEndpoint(lead, opts)
  return script
}

export default { generateAIScript }
