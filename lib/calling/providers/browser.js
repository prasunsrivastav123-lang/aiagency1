// lib/calling/providers/browser.js
//
// Browser/device calling provider. On mobile this opens the native dialer
// via a tel: link. On desktop (where tel: links usually go nowhere) it
// falls back to copying the number to the clipboard so the rep can dial
// from their desk phone or softphone.

function isLikelyDesktop() {
  if (typeof navigator === 'undefined') return true
  const ua = navigator.userAgent || ''
  return !/Mobi|Android|iPhone|iPad|iPod/i.test(ua)
}

async function copyToClipboard(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (e) {
    // fall through to legacy copy
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  } catch (e) {
    return false
  }
}

/**
 * startBrowserCall(number)
 * Attempts to open the device dialer via tel:. On desktop, copies the
 * number to the clipboard instead since tel: has no reliable handler.
 *
 * Returns: { started: boolean, mode: 'dialer' | 'clipboard', copied: boolean }
 */
export async function startBrowserCall(number) {
  const clean = String(number || '').trim()
  if (!clean) return { started: false, mode: null, copied: false }

  if (isLikelyDesktop()) {
    const copied = await copyToClipboard(clean)
    return { started: copied, mode: 'clipboard', copied }
  }

  if (typeof window !== 'undefined') {
    window.open(`tel:${clean}`, '_self')
  }
  return { started: true, mode: 'dialer', copied: false }
}

export default { startBrowserCall }
