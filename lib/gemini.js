// Server-only helper to call Google Gemini 2.5 Flash through the Emergent LLM proxy
// which is an OpenAI-compatible endpoint. The EMERGENT_LLM_KEY is a universal
// key managed by the platform — no separate Google/OpenAI/Anthropic key needed.
//
// Endpoint: https://integrations.emergentagent.com/llm/chat/completions
// Model:    gemini/gemini-2.5-flash

export async function callGemini(messages, { jsonMode = true, temperature = 0.7 } = {}) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key) throw new Error('EMERGENT_LLM_KEY missing')

  const body = {
    model: 'gemini/gemini-2.5-flash',
    messages,
    temperature,
  }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const res = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gemini call failed ${res.status}: ${t}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content || ''
  if (!jsonMode) return content
  try {
    // Strip fenced code if present
    const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error('JSON parse failed', content)
    throw new Error('Model did not return valid JSON')
  }
}
