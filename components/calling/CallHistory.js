'use client'

// components/calling/CallHistory.js
//
// Renders call history from GET /api/calls (passed down as `calls`),
// newest first. Clicking a row loads that call + its lead into CallCard
// via onSelectCall.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { History, Clock, Building2 } from 'lucide-react'
import { formatDuration } from '@/lib/calling/analytics'

const STATUS_STYLES = {
  interested: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'meeting-booked': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  scheduled: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  completed: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  busy: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'call-back': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'no-answer': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  missed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'wrong-number': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  initiated: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

function formatDate(dateLike) {
  if (!dateLike) return '—'
  const d = new Date(dateLike)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function CallHistory({ calls = [], onSelectCall, selectedCallId }) {
  const sorted = useMemo(
    () => [...calls].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [calls]
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/10 p-5 sm:p-6">
        <History className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Call History</h3>
        <span className="ml-auto text-xs text-slate-500">{sorted.length} calls</span>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">No calls logged yet.</div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {sorted.map((call, i) => (
            <motion.button
              key={call.id || i}
              onClick={() => onSelectCall?.(call)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              className={`w-full px-5 sm:px-6 py-4 text-left transition-colors ${
                selectedCallId === call.id ? 'bg-violet-500/10' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-white/10">
                    <Building2 className="h-3.5 w-3.5 text-violet-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-100">
                      {call.business || 'Unknown Business'}
                    </div>
                    <div className="truncate text-xs text-slate-500">{call.owner || '—'}</div>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                    STATUS_STYLES[call.status] || STATUS_STYLES.initiated
                  }`}
                >
                  {(call.status || 'initiated').replace('-', ' ')}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{formatDate(call.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(call.duration || 0)}
                </span>
              </div>

              {call.summary && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-400">{call.summary}</p>
              )}
              {!call.summary && call.notes && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-500 italic">{call.notes}</p>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
