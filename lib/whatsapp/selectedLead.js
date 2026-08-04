// lib/whatsapp/selectedLead.js
// Lightweight client-side handoff between Lead Finder and WhatsApp Campaign.
// Module-level state survives client-side (App Router) navigation because
// the JS module stays loaded in the browser between route changes — it does
// NOT survive a hard refresh. A sessionStorage mirror is included so a
// refresh on /dashboard/whatsapp doesn't lose the selected lead; the plain
// getSelectedLead()/setSelectedLead() API you asked for is unchanged.

let selectedLead = null

export function setSelectedLead(lead) {
  selectedLead = lead
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem('agencyos:selectedLead', JSON.stringify(lead))
    } catch (e) {
      // sessionStorage unavailable (e.g. private mode) — in-memory value still works
    }
  }
}

export function getSelectedLead() {
  if (selectedLead) return selectedLead
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem('agencyos:selectedLead')
      if (raw) {
        selectedLead = JSON.parse(raw)
        return selectedLead
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}

export function clearSelectedLead() {
  selectedLead = null
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem('agencyos:selectedLead')
    } catch (e) {
      // ignore
    }
  }
}