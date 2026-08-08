'use client'

import { Button } from '@/components/ui/button'

export const TEMPLATES = [
  { title: 'Welcome', description: 'A friendly first-contact introduction.', category: 'First contact', bestFor: 'general', body: 'Hi {{name}}, I would love to share a quick idea for {{business}}.' },
  { title: 'Website Offer', description: 'A tailored pitch for businesses without a web presence.', category: 'No website', bestFor: 'noWebsite', body: 'Hi {{name}}, I noticed {{business}} could benefit from a modern online home. I made a free preview for you.' },
  { title: 'Review Improvement', description: 'A gentle reputation and booking improvement offer.', category: 'Reputation', bestFor: 'lowRating', body: 'Hi {{name}}, I have a simple idea to help {{business}} turn more customer feedback into bookings.' },
  { title: 'Booking Reminder', description: 'A concise follow-up for existing clients.', category: 'Existing clients', bestFor: 'general', body: 'Hi {{name}}, just a reminder that your next growth opportunity is ready for {{business}}.' },
  { title: 'Re-engagement', description: 'A low-pressure message to revive cold conversations.', category: 'Cold leads', bestFor: 'general', body: 'Hi {{name}}, checking in — would you still like to see the free idea I prepared for {{business}}?' },
  { title: 'Festival Offer', description: 'A seasonal promotion with a clear time window.', category: 'Seasonal', bestFor: 'general', body: 'Hi {{name}}, we are running a limited seasonal offer for {{business}}. Want the details?' },
  { title: 'Free Audit', description: 'A lead-magnet opener that offers immediate value.', category: 'Lead magnet', bestFor: 'general', body: 'Hi {{name}}, I put together a short free growth audit for {{business}}. May I send it over?' },
]

export default function TemplateLibrary({ onSelect, suggestedFor }) {
  return <div className="space-y-2">{TEMPLATES.map((template) => <button key={template.title} type="button" onClick={() => onSelect?.(template)} className={`w-full rounded-xl border p-3 text-left transition ${template.bestFor === suggestedFor ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-white">{template.title}</span><span className="text-[10px] text-white/40">{template.category}</span></div><p className="mt-1 text-xs text-white/55">{template.description}</p><p className="mt-1 line-clamp-2 text-xs text-white/35">{template.body}</p></button>)}</div>
}
