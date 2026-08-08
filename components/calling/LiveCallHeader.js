'use client'

import { useEffect, useState } from 'react'
import { Mic, Pause, PhoneOff } from 'lucide-react'
import SearchContextBadge from '@/components/shared/SearchContextBadge'

function format(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` }

export default function LiveCallHeader({ lead, activeCall, onEnd }) {
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [held, setHeld] = useState(false)
  useEffect(() => { if (!activeCall?.__live) { setSeconds(activeCall?.duration || 0); return undefined } const started = activeCall.__startedAt || Date.now(); const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000); return () => clearInterval(timer) }, [activeCall?.id, activeCall?.__live, activeCall?.__startedAt, activeCall?.duration])
  if (!lead || !activeCall?.__live) return null
  return <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"><div><div className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /><span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Live call · {format(seconds)}</span></div><div className="mt-1 font-semibold text-white">{lead.business}</div><div className="text-sm text-slate-400">{lead.phone}</div><SearchContextBadge leadId={lead.leadId || lead.id} className="mt-2" /></div><div className="flex gap-2"><button type="button" onClick={() => setMuted((value) => !value)} className={`rounded-xl border px-3 py-2 text-xs ${muted ? 'border-violet-500/40 bg-violet-500/10 text-violet-200' : 'border-white/10 text-slate-300'}`}><Mic className="mr-1 inline h-3.5 w-3.5" /> {muted ? 'Unmute' : 'Mute'}</button><button type="button" onClick={() => setHeld((value) => !value)} className={`rounded-xl border px-3 py-2 text-xs ${held ? 'border-violet-500/40 bg-violet-500/10 text-violet-200' : 'border-white/10 text-slate-300'}`}><Pause className="mr-1 inline h-3.5 w-3.5" /> {held ? 'Resume' : 'Hold'}</button><button type="button" onClick={onEnd} className="rounded-xl bg-rose-500 px-3 py-2 text-xs text-white"><PhoneOff className="mr-1 inline h-3.5 w-3.5" /> End call</button></div></div>
}
