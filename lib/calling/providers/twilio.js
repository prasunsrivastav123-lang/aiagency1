// Twilio calling provider.
// Kept ready for real outbound calling, but never required — the app falls
// back to the browser tel: provider whenever these env vars are absent.
//
// Required env vars (all optional at runtime):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_PHONE_NUMBER

export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  )
}

export async function placeCall(phone, { statusCallbackUrl } = {}) {
  if (!isTwilioConfigured()) {
    return { success: false, error: 'Twilio is not configured' }
  }

  // Lazy import so the `twilio` package is only required if this provider
  // is actually used (keeps the browser-only setup dependency-free).
  const twilio = (await import('twilio')).default
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  try {
    const call = await client.calls.create({
      to: `+${String(phone).replace(/^\+/, '')}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: 'http://demo.twilio.com/docs/voice.xml', // TODO: replace with real TwiML endpoint
      ...(statusCallbackUrl ? { statusCallback: statusCallbackUrl } : {}),
    })
    return { success: true, provider: 'twilio', sid: call.sid, status: call.status }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export const twilioProvider = {
  name: 'twilio',
  placeCall,
  requiresCredentials: true,
  isConfigured: isTwilioConfigured,
}

export default twilioProvider