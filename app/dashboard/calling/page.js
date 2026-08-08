'use client'

// app/dashboard/calling/page.js
//
// Main Calling dashboard. Fetches from GET /api/calls and
// GET /api/calls/stats, and wires every calling component together.
// State owned here: selectedLead, selectedCall, callHistory, callScript,
// stats. No backend files are touched — this page only consumes the
// documented endpoints via lib/calling.

import { Suspense, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PhoneCall, Sparkles } from 'lucide-react'

import CallStats from '@/components/calling/CallStats'
import CallQueue from '@/components/calling/CallQueue'
import CallCard from '@/components/calling/CallCard'
import CallScript from '@/components/calling/CallScript'
import CallHistory from '@/components/calling/CallHistory'
import IncomingLeadCard from '@/components/calling/IncomingLeadCard'
import FollowupTimeline from '@/components/calling/FollowupTimeline'
import ScheduleCallDialog from '@/components/calling/ScheduleCallDialog'
import LiveCallHeader from '@/components/calling/LiveCallHeader'
import ObjectionHelper from '@/components/calling/ObjectionHelper'
import NotesPanel from '@/components/calling/NotesPanel'

import { getCalls, getStats, getSavedLeads, generateScript, updateCall } from '@/lib/calling/index'
import { startBrowserCall } from '@/lib/calling/providers/browser'

function CallingDashboard() {
  const [selectedLead, setSelectedLead] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [callHistory, setCallHistory] = useState([])
  const [savedLeads, setSavedLeads] = useState([])
  const [callScript, setCallScript] = useState(null)
  const [stats, setStats] = useState(null)

  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [generatingScript, setGeneratingScript] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [insertedNote, setInsertedNote] = useState('')

  const refreshHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const calls = await getCalls()
      setCallHistory(calls)
    } catch (e) {
      // silent — history simply stays empty/stale
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await getStats()
      setStats(data)
    } catch (e) {
      // silent
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    refreshHistory()
    refreshStats()
    getSavedLeads().then(setSavedLeads).catch(() => {})
  }, [refreshHistory, refreshStats])

  const handleGenerateScript = useCallback(async (lead, opts = {}) => {
    if (!lead) return
    setGeneratingScript(true)
    try {
      const script = await generateScript(
        {
          business: lead.business,
          owner: lead.owner,
          website: lead.website,
          rating: lead.rating,
          category: lead.category,
        },
        { ...opts, callId: selectedCall?.id }
      )
      setCallScript(script)
    } catch (e) {
      // Backend already falls back locally on Gemini failure; a thrown
      // error here means the request itself failed, so fail silently per
      // spec rather than surfacing a raw error.
    } finally {
      setGeneratingScript(false)
    }
  }, [selectedCall?.id])

  // Selecting a lead auto-loads its script, history context, and timeline.
  const handleSelectLead = useCallback(
    (lead) => {
      setSelectedLead(lead)
      setCallScript(null)

      const latestCall = [...callHistory]
        .filter((c) => c.leadId && lead?.leadId && c.leadId === lead.leadId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

      setSelectedCall(latestCall || null)
      handleGenerateScript(lead)
    },
    [callHistory, handleGenerateScript]
  )

  const handleSelectCall = useCallback((call) => {
    setSelectedCall(call)
    setSelectedLead((prev) => ({
      leadId: call.leadId || prev?.leadId,
      business: call.business,
      owner: call.owner,
      phone: call.phone,
      website: call.website,
      category: call.category,
      address: call.address,
      rating: call.rating,
      score: prev?.leadId === call.leadId ? prev?.score : 0,
      raw: prev?.leadId === call.leadId ? prev?.raw : {},
    }))
    if (call.script) setCallScript(call.script)
  }, [])

  const handleCallCreated = useCallback((call) => {
    setSelectedCall(call)
    if (call.id) setCallHistory((prev) => [call, ...prev])
  }, [])

  const handleCallUpdated = useCallback((call) => {
    setSelectedCall(call)
    setCallHistory((prev) => prev.map((c) => (c.id === call.id ? { ...c, ...call } : c)))
    refreshStats()
  }, [refreshStats])

  const handleIncomingStartCall = useCallback(
    async (lead) => {
      handleSelectLead(lead)
      if (lead.phone) await startBrowserCall(lead.phone)
    },
    [handleSelectLead]
  )

  const handleEndLiveCall = useCallback(async () => {
    if (!selectedCall) return
    try {
      const updated = selectedCall.id ? await updateCall({ id: selectedCall.id, status: 'completed', duration: selectedCall.duration || 0 }) : selectedCall
      handleCallUpdated({ ...updated, __live: false })
    } catch (error) {
      console.error('[Calling] end call failed:', error)
      handleCallUpdated({ ...selectedCall, __live: false })
    }
  }, [selectedCall, handleCallUpdated])

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <PhoneCall className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              AI Calling
            </h1>
            <p className="text-sm text-slate-400">Call, script, and follow up — all in one place</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          <span className="text-xs font-medium text-violet-200">AI-Powered</span>
        </div>
      </motion.div>

      <IncomingLeadCard
        onDetected={handleSelectLead}
        onStartCall={handleIncomingStartCall}
        onGenerateScript={handleGenerateScript}
      />

      <CallStats stats={stats} loading={loadingStats} />

      <LiveCallHeader lead={selectedLead} activeCall={selectedCall} onEnd={handleEndLiveCall} />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        {/* <CallQueue
          savedLeads={savedLeads}
          calls={callHistory}
          selectedLead={selectedLead}
          onSelectLead={handleSelectLead}
        /> */}

        <CallCard
          lead={selectedLead}
          activeCall={selectedCall}
          onCallCreated={handleCallCreated}
          onCallUpdated={handleCallUpdated}
          onGenerateScript={handleGenerateScript}
          generatingScript={generatingScript}
        />
      </div>

      <CallScript
        lead={selectedLead}
        script={callScript}
        generating={generatingScript}
        onRegenerate={handleGenerateScript}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ObjectionHelper lead={selectedLead} onInsert={setInsertedNote} />
        <NotesPanel callId={selectedCall?.id} initialNotes={selectedCall?.notes || ''} insertText={insertedNote} />
      </div>

      <FollowupTimeline
        calls={callHistory}
        leadId={selectedLead?.leadId}
        onScheduleNext={() => setScheduleOpen(true)}
      />

      <CallHistory
        calls={callHistory}
        onSelectCall={handleSelectCall}
        selectedCallId={selectedCall?.id}
      />

      {loadingHistory && callHistory.length === 0 && (
        <p className="text-center text-xs text-slate-600">Loading call history…</p>
      )}

      <ScheduleCallDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        lead={selectedLead}
        callId={selectedCall?.id}
        onScheduled={() => {
          refreshHistory()
          refreshStats()
        }}
      />
    </div>
  )
}

export default function CallingPage() {
  return (
    <Suspense fallback={null}>
      <CallingDashboard />
    </Suspense>
  )
}
