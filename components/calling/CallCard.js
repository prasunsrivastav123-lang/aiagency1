'use client'

// components/calling/CallCard.js
//
// The large CRM-style card for the selected lead. Handles starting a call
// (POST /api/calls), updating status/duration (PATCH /api/calls), saving
// notes (POST /api/calls/note), and exposes "Generate Script" which the
// parent page wires to CallScript.

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Globe,
  Tag,
  Sparkles,
  Copy,
  ExternalLink,
  Map as MapIcon,
  Save,
  PhoneCall,
  PhoneOff,
  Check,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { createCall, updateCall, saveNotes, followup } from '@/lib/calling/index'
import { startBrowserCall } from '@/lib/calling/providers/browser'
import { formatDuration } from '@/lib/calling/analytics'
import SearchContextBadge from '@/components/shared/SearchContextBadge'

const STATUS_OPTIONS = [
  { value: 'initiated', label: 'Initiated' },
  { value: 'interested', label: 'Interested' },
  { value: 'busy', label: 'Busy' },
  { value: 'no-answer', label: 'No Answer' },
  { value: 'wrong-number', label: 'Wrong Number' },
  { value: 'call-back', label: 'Call Back' },
  { value: 'meeting-booked', label: 'Meeting Booked' },
  { value: 'completed', label: 'Completed' },
]

const OUTCOME_CHIPS = ['interested', 'meeting-booked', 'call-back', 'busy', 'no-answer', 'wrong-number']

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-slate-200">{value}</div>
      </div>
    </div>
  )
}

export default function CallCard({
  lead,
  activeCall,
  onCallCreated,
  onCallUpdated,
  onGenerateScript,
  generatingScript = false,
}) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  const isLive = activeCall?.status === 'initiated' && activeCall?.__live

  useEffect(() => {
    setNotes(activeCall?.notes || '')
  }, [activeCall?.id])

  useEffect(() => {
    if (isLive) {
      const startedAt = activeCall.__startedAt || Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startedAt) / 1000))
      }, 1000)
    } else {
      setElapsed(activeCall?.duration || 0)
    }
    return () => timerRef.current && clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, activeCall?.id])

  if (!lead) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <div>
          <PhoneCall className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">Select a lead from the queue to get started</p>
        </div>
      </div>
    )
  }

  async function handleStartCall() {
    setStarting(true)
    try {
      const call = await createCall({
        leadId: lead.leadId,
        business: lead.business,
        owner: lead.owner,
        phone: lead.phone,
        website: lead.website,
        category: lead.category,
        address: lead.address,
        rating: lead.rating,
        provider: 'browser',
        status: 'initiated',
      })
      const started = await startBrowserCall(lead.phone)
      onCallCreated?.({ ...call, __live: true, __startedAt: Date.now(), __copied: started.copied })
    } catch (e) {
      // Silent per spec — never surface raw errors. Still create a local
      // best-effort record so the rep isn't blocked.
      onCallCreated?.({
        id: null,
        business: lead.business,
        owner: lead.owner,
        phone: lead.phone,
        status: 'initiated',
        __live: true,
        __startedAt: Date.now(),
      })
    } finally {
      setStarting(false)
    }
  }

  async function handleEndCall() {
    if (!activeCall?.id) return
    try {
      const updated = await updateCall({
        id: activeCall.id,
        status: activeCall.status === 'initiated' ? 'completed' : activeCall.status,
        duration: elapsed,
      })
      onCallUpdated?.({ ...updated, __live: false })
    } catch (e) {
      onCallUpdated?.({ ...activeCall, __live: false, duration: elapsed })
    }
  }

  async function handleStatusChange(status) {
    setStatusOpen(false)
    if (!activeCall?.id) return
    try {
      const updated = await updateCall({ id: activeCall.id, status })
      onCallUpdated?.({ ...updated, __live: activeCall.__live, __startedAt: activeCall.__startedAt })
    } catch (e) {
      onCallUpdated?.({ ...activeCall, status })
    }
  }

  async function handleOutcome(outcome) {
    if (!activeCall?.id) return
    const previous = activeCall.status
    onCallUpdated?.({ ...activeCall, status: outcome })
    try {
      const updated = await followup({ callId: activeCall.id, outcome, note: notes })
      onCallUpdated?.({ ...activeCall, ...updated, status: outcome })
    } catch (error) {
      console.error('[CallCard] outcome failed:', error)
      onCallUpdated?.({ ...activeCall, status: previous })
    }
  }

  async function handleSaveNotes() {
    if (!activeCall?.id) return
    setSavingNotes(true)
    setNotesSaved(false)
    try {
      const updated = await saveNotes({ callId: activeCall.id, notes, generateSummary: true })
      onCallUpdated?.({ ...activeCall, ...updated })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch (e) {
      // silent
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleCopyNumber() {
    await startBrowserCall(lead.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const currentStatus = activeCall?.status || 'initiated'
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg overflow-hidden"
    >
      <div className="relative border-b border-white/10 p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg sm:text-xl font-semibold text-white">{lead.business}</h2>
            {lead.owner && <p className="mt-0.5 text-sm text-slate-400">{lead.owner}</p>}
            <SearchContextBadge leadId={lead.leadId || lead.id} className="mt-2" />
          </div>

          <div className="flex items-center gap-3">
            {lead.score > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
                <span className="text-xs font-semibold text-fuchsia-200">AI Score {lead.score}</span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setStatusOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium capitalize text-slate-200 hover:border-white/20 transition"
              >
                {statusMeta.label}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {statusOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#12101c] shadow-xl"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`block w-full px-3.5 py-2 text-left text-xs transition hover:bg-violet-500/10 ${
                          opt.value === currentStatus ? 'text-violet-300' : 'text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 sm:grid-cols-2">
        <InfoRow icon={Phone} label="Phone" value={lead.phone} />
        <InfoRow icon={Mail} label="Email" value={lead.raw?.email} />
        <InfoRow icon={MapPin} label="Address" value={lead.address} />
        <InfoRow icon={Star} label="Rating" value={lead.rating ? `${lead.rating} / 5` : null} />
        <InfoRow icon={Globe} label="Website" value={lead.website} />
        <InfoRow icon={Tag} label="Category" value={lead.category} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-5 sm:p-6">
        {!isLive ? (
          <button
            onClick={handleStartCall}
            disabled={starting || !lead.phone}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PhoneCall className="h-4 w-4" />
            {starting ? 'Starting…' : 'Start Call'}
          </button>
        ) : (
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110"
          >
            <PhoneOff className="h-4 w-4" />
            End Call · {formatDuration(elapsed)}
          </button>
        )}

        <button
          onClick={() => onGenerateScript?.(lead)}
          disabled={generatingScript}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          {generatingScript ? 'Generating…' : 'Generate Script'}
        </button>

        <button
          onClick={handleCopyNumber}
          disabled={!lead.phone}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 disabled:opacity-40"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy Number'}
        </button>

        {lead.website && (
          <a
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20"
          >
            <ExternalLink className="h-4 w-4" />
            Open Website
          </a>
        )}

        {lead.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20"
          >
            <MapIcon className="h-4 w-4" />
            Open Maps
          </a>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-4 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">Call outcome</p>
        <div className="flex flex-wrap gap-2">{OUTCOME_CHIPS.map((outcome) => <button key={outcome} disabled={!activeCall?.id} onClick={() => handleOutcome(outcome)} className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${currentStatus === outcome ? 'border-violet-500/50 bg-violet-500/15 text-violet-200' : 'border-white/10 text-slate-300 hover:bg-white/5'} disabled:opacity-40`}>{outcome.replace('-', ' ')}</button>)}</div>
      </div>

      <div className="border-t border-white/10 p-5 sm:p-6">
        <label className="mb-2 block text-[11px] uppercase tracking-wide text-slate-500">
          Call Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!activeCall?.id}
          rows={3}
          placeholder={activeCall?.id ? 'What happened on this call?' : 'Start a call to add notes'}
          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition disabled:opacity-40"
        />
        <div className="mt-2.5 flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={!activeCall?.id || savingNotes}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-xs font-medium text-white shadow-md shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-40"
          >
            {notesSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {savingNotes ? 'Saving…' : notesSaved ? 'Saved' : 'Save Notes'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
