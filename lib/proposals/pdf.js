export function generateProposalPDF(proposal) {
  try {
    if (typeof window === 'undefined') return false
    const popup = window.open('', '_blank', 'noopener,noreferrer')
    if (!popup) return false
    const escape = (value) => String(value || '').replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]))
    popup.document.write(`<!doctype html><html><head><title>${escape(proposal.title || 'Proposal')}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;color:#18112a}h1{font-size:34px}h2{margin-top:30px;color:#6d28d9}section{border-top:1px solid #ddd;padding-top:14px;margin-top:20px}.accent{color:#7c3aed}</style></head><body><p class="accent">AGENCYOS AI · PROPOSAL</p><h1>${escape(proposal.title)}</h1><p>Prepared for ${escape(proposal.business)}</p>${proposal.sections.map((section) => `<section><h2>${escape(section.title)}</h2><p>${escape(section.body).replace(/\n/g, '<br>')}</p></section>`).join('')}<script>window.onload=()=>window.print()</script></body></html>`)
    popup.document.close()
    return true
  } catch { return false }
}
