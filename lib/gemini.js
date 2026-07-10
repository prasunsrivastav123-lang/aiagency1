import { GoogleGenerativeAI } from "@google/generative-ai";

// -----------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------
// Uses the same env var name you already had configured. If yours is
// named differently (e.g. GOOGLE_API_KEY), just change this one line.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "[gemini] GEMINI_API_KEY is not set. AI calls will fail until it's configured."
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Primary model tried first, fallback used only if the primary keeps
// failing with a retryable error (503/429/500/overloaded).
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converts a simple [{role, content}] message array (the format your
 * suggest route already uses) into Gemini's { systemInstruction, contents }
 * shape. "system" messages are merged into systemInstruction; everything
 * else becomes a user/model turn.
 */
function toGeminiPayload(messages) {
  let systemInstruction = "";
  const contents = [];

  for (const m of messages) {
    if (!m) continue;
    if (m.role === "system") {
      systemInstruction += (systemInstruction ? "\n" : "") + m.content;
      continue;
    }
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content ?? "") }],
    });
  }

  return { systemInstruction, contents };
}

/**
 * Gemini sometimes wraps JSON in ```json fences, or adds stray text
 * around it. This pulls out the first valid JSON object/array it can find.
 */
function extractJson(text) {
  if (!text) throw new Error("Empty Gemini response");

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // try normal parse first
  try {
    return JSON.parse(cleaned);
  } catch {}

  // find first {
  const first = cleaned.indexOf("{");

  // find last }
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1)
    throw new Error("Gemini response did not contain JSON");

  const json = cleaned.substring(first, last + 1);

  try {
    return JSON.parse(json);
  } catch {
    console.log("---------------");
    console.log(cleaned);
    console.log("---------------");

    throw new Error("Gemini returned invalid JSON");
  }
}

function isRetryable(err) {
  const status = err?.status ?? err?.response?.status;
  const message = String(err?.message || "");

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    /service unavailable/i.test(message) ||
    /overloaded/i.test(message) ||
    /resource_exhausted/i.test(message) ||
    /timed out/i.test(message)
  );
}

async function callModelOnce({
  modelName,
  contents,
  systemInstruction,
  generationConfig,
  timeoutMs,
}) {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const request = {
    contents,
    generationConfig,
  };

  if (systemInstruction) {
    request.systemInstruction = {
      parts: [
        {
          text: systemInstruction,
        },
      ],
    };
  }

  const generatePromise = model.generateContent(request);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          Object.assign(new Error("Gemini request timed out"), {
            status: 503,
          })
        ),
      timeoutMs
    )
  );

  const result = await Promise.race([generatePromise, timeoutPromise]);
  const text = await result.response.text();

  console.log("========== GEMINI ==========");
  console.log(text);
  console.log("============================");

  return text;
}

// -----------------------------------------------------------------------
// Public API — same signature you already call:
//   callGemini(messages, { jsonMode, temperature, maxOutputTokens, model })
// -----------------------------------------------------------------------
export async function callGemini(messages, options = {}) {
  const {
    jsonMode = false,
    temperature = 0.4,
    maxOutputTokens = 700,
    model: modelOverride = null,
    timeoutMs = 15000,
  } = options;

  const { systemInstruction, contents } = toGeminiPayload(messages);

  const generationConfig = {
    temperature,
    maxOutputTokens,
    // FIX: "text/plain" left the model free to add prose/markdown around
    // the JSON and gave no guarantee of well-formed output, which is what
    // was causing responses to get cut off mid-object ("Incomplete JSON").
    // "application/json" forces Gemini to emit only valid, complete JSON.
    ...(jsonMode ? { responseMimeType: "application/json" } : {}),
  };

  const modelsToTry = modelOverride
    ? [modelOverride]
    : [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastErr;

  for (let m = 0; m < modelsToTry.length; m++) {
    const modelName = modelsToTry[m];
    const maxAttempts = m === 0 ? 3 : 2; // more patience with the primary model

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const text = await callModelOnce({
          modelName,
          contents,
          systemInstruction,
          generationConfig,
          timeoutMs,
          jsonMode, // FIX: pass jsonMode through so callModelOnce can see it
        });
       if (jsonMode) {

    const opens = (text.match(/{/g) || []).length;
    const closes = (text.match(/}/g) || []).length;

    if (opens !== closes) {

        throw Object.assign(
            new Error("Incomplete JSON"),
            { status:503 }
        );

    }

    return extractJson(text);

}

return text;
      } catch (err) {
if (err?.status === 429) {

    lastErr = err;

    console.log(`${modelName} quota exceeded, trying next model...`);

    break;

}

        lastErr = err;
        const retryable = isRetryable(err);
        console.error(
          `[gemini] ${modelName} attempt ${attempt}/${maxAttempts} failed:`,
          err?.message || err
        );

        if (!retryable || attempt === maxAttempts) break;

        // exponential backoff with jitter: ~500ms, ~1.3s, ~2.9s
        const backoff = 500 * 2 ** (attempt - 1) + Math.random() * 300;
        await sleep(backoff);
      }
    }
  }

  // Every model/attempt failed — surface one clean, catchable error instead
  // of letting the raw SDK error (with its huge stack) bubble up as a 500.
  const friendly = new Error(
    lastErr?.status === 429
      ? "Gemini API quota exceeded."
      : "AI service temporarily unavailable."
  );

  friendly.status = lastErr?.status || 503;
  friendly.cause = lastErr;

  throw friendly;
}