'use client'

import { MessageCircle } from 'lucide-react'
import { setSelectedLead } from '@/lib/whatsapp/selectedLead'

const OBJECTIONS = {
  'Too Expensive': 'I understand. We can start with the highest-impact piece and scale only after it brings results.',
  'Already Have Website': 'That’s great — I can share a quick audit focused on conversions and local visibility rather than rebuilding everything.',
  'Not Interested': 'No problem at all. Would it be helpful if I sent a brief, no-obligation audit for whenever timing changes?',
  'Call Later': 'Of course. What day and time would be most convenient for a quick follow-up?',
}

export default function ObjectionHelper({ lead, onInsert }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h3 className="text-sm font-semibold text-white">Objection helper</h3><p className="mt-1 text-xs text-slate-400">Adds a suggested response to your notes without replacing your draft.</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(OBJECTIONS).map(([label, response]) => <button key={label} type="button" onClick={() => onInsert?.(response)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-violet-500/10">{label}</button>)}<button type="button" onClick={() => { if (lead) setSelectedLead({ ...lead, name: lead.business }); onInsert?.('Send a short WhatsApp follow-up with the promised details.') }} className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-200"><MessageCircle className="mr-1 inline h-3.5 w-3.5" /> Send WhatsApp</button></div></section>
}
