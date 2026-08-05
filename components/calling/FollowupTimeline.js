'use client'

// components/calling/FollowupTimeline.js
//
// Renders a timeline of call outcomes (Interested, Busy, Call Back,
// Meeting Booked, No Answer, Wrong Number) for the selected lead, built
// from the call history already fetched via GET /api/calls (no separate
// timeline endpoint exists, so we derive it from each call's status/
// followup fields rather than inventing a new route).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ThumbsUp,
  PhoneOff,
  PhoneCall,
  CalendarCheck2,
  PhoneMissed,
  Ban,
  CalendarPlus,
  GitCommitVertical,
} from 'lucide-react'

const OUTCOME_META = {
  interested: { label: 'Interested', icon: ThumbsUp, color: 'text-emerald-300', dot: 'bg-emerald-500' },
  busy: { label: 'Busy', icon: PhoneOff, color: 'text-amber-300', dot: 'bg-amber-500' },
  'call-back': { label: 'Call Back', icon: PhoneCall, color: 'text-amber-300', dot: 'bg-amber-500' },
  'meeting-booked': { label: 'Meeting Booked', icon: CalendarCheck2, color: 'text-purple-300', dot: 'bg-purple-500' },
  'no-answer': { label: 'No Answer', icon: PhoneMissed, color: 'text-rose-300', dot: 'bg-rose-500' },
  'wrong-number': { label: 'Wrong Number', icon: Ban, color: 'text-rose-300', dot: 'bg-rose-500' },
}

function formatDateTime(dateLike) {
  if (!dateLike) return { date: '—', time: '' }
  const d = new Date(dateLike)
  return {
    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function FollowupTimeline({ calls = [], leadId, onScheduleNext }) {
  const events = useMemo(() => {
    return calls
      .filter((c) => (leadId ? c.leadId === leadId : true) && OUTCOME_META[c.status])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [calls, leadId])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <GitCommitVertical className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Follow-up Timeline</h3>
        </div>
        <button
          onClick={() => onScheduleNext?.()}
          disabled={!leadId}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-xs font-medium text-white shadow-md shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-40"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Schedule Next Call
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {!leadId ? (
          <div className="py-6 text-center text-sm text-slate-500">Select a lead to see its timeline.</div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">No follow-up activity yet for this lead.</div>
        ) : (
          <ol className="relative space-y-5 border-l border-white/10 pl-5">
            {events.map((call, i) => {
              const meta = OUTCOME_META[call.status]
              const Icon = meta.icon
              const { date, time } = formatDateTime(call.followup?.createdAt || call.updatedAt || call.createdAt)
              const note = call.followup?.note || call.notes

              return (
                <motion.li
                  key={call.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-4 ring-[#0A0A12] ${meta.dot}`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                    <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-xs text-slate-500">
                      {date} · {time}
                    </span>
                  </div>
                  {note && <p className="mt-1 text-sm text-slate-300">{note}</p>}
                </motion.li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
