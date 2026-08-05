'use client'

// components/calling/ScheduleCallDialog.js
//
// Professional scheduling dialog. Submits to POST /api/calls/schedule
// exactly as documented and closes itself on success.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarClock, Bell, Flag, UserCheck, Loader2 } from 'lucide-react'
import { scheduleFollowup } from '@/lib/calling/scheduler/index'

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

export default function ScheduleCallDialog({ open, onClose, lead, callId, onScheduled }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reminder, setReminder] = useState(true)
  const [priority, setPriority] = useState('normal')
  const [assignedTo, setAssignedTo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setDate('')
    setTime('')
    setReminder(true)
    setPriority('normal')
    setAssignedTo('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date || !time) {
      setError('Please choose both a date and time.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const doc = await scheduleFollowup({
        callId: callId || null,
        leadId: lead?.leadId || null,
        business: lead?.business || '',
        owner: lead?.owner || '',
        phone: lead?.phone || '',
        date,
        time,
        reminder,
        priority,
        assignedTo: assignedTo || undefined,
      })
      onScheduled?.(doc)
      reset()
      onClose?.()
    } catch (e2) {
      setError(e2.message || 'Could not schedule the call. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#12101c] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                  <CalendarClock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Schedule Next Call</h3>
                  {lead?.business && <p className="text-xs text-slate-500">{lead.business}</p>}
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-500">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-500">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                  <Flag className="h-3 w-3" /> Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        priority === p.value
                          ? 'border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                  <UserCheck className="h-3 w-3" /> Assign To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Leave blank to assign to yourself"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>

              <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/30 accent-violet-600"
                />
                <Bell className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-sm text-slate-200">Remind me before this call</span>
              </label>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                {submitting ? 'Scheduling…' : 'Schedule'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
