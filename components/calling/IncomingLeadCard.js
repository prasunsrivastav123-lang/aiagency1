'use client'

// components/calling/IncomingLeadCard.js
//
// If the user arrived from Lead Finder, this detects the handed-off lead
// and surfaces a quick-launch card above the rest of the dashboard.
// Detection sources (read-only, nothing else is touched):
//   1. `leadId` / `business` query params on the URL
//   2. `sessionStorage.getItem('callingLead')` — the convention Lead Finder
//      uses to hand a lead over before navigating here
// Once detected, `onDetected` bubbles the lead up to the page so it becomes
// the selectedLead for the rest of the dashboard.

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Phone, Star, Globe, PhoneCall, FileText, X, ArrowRightCircle } from 'lucide-react'

function readHandoffLead(searchParams) {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem('callingLead')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed) return parsed
    }
  } catch (e) {
    // ignore malformed handoff payloads
  }

  const business = searchParams?.get('business')
  const leadId = searchParams?.get('leadId')
  if (business || leadId) {
    return {
      leadId: leadId || null,
      business: business || '',
      owner: searchParams?.get('owner') || '',
      phone: searchParams?.get('phone') || '',
      website: searchParams?.get('website') || '',
      rating: Number(searchParams?.get('rating')) || 0,
      score: Number(searchParams?.get('score')) || 0,
    }
  }

  return null
}

export default function IncomingLeadCard({ onDetected, onStartCall, onGenerateScript }) {
  const searchParams = useSearchParams()
  const [lead, setLead] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const detected = readHandoffLead(searchParams)
    if (detected) {
      setLead(detected)
      onDetected?.(detected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!lead || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-violet-600/15 p-5 sm:p-6 shadow-lg shadow-violet-500/10"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
          <ArrowRightCircle className="h-3.5 w-3.5" />
          Incoming from Lead Finder
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{lead.business || 'New Lead'}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              {lead.owner && <span>{lead.owner}</span>}
              {lead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {lead.phone}
                </span>
              )}
              {lead.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {lead.rating}
                </span>
              )}
              {lead.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {lead.website}
                </span>
              )}
              {lead.score > 0 && (
                <span className="flex items-center gap-1 text-fuchsia-300">
                  <Sparkles className="h-3 w-3" /> Score {lead.score}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartCall?.(lead)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110"
            >
              <PhoneCall className="h-4 w-4" />
              Start Call
            </button>
            <button
              onClick={() => onGenerateScript?.(lead)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10"
            >
              <FileText className="h-4 w-4" />
              Generate Script
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
