'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

import StatsCards from '@/components/crm/StatsCards'
import LeadCard from '@/components/crm/LeadCard'
import LeadDetailSheet from '@/components/crm/LeadDetailSheet'
import ActivityFeed from '@/components/crm/ActivityFeed'
import FilterBar from '@/components/crm/FilterBar'
import PipelineCharts from '@/components/crm/PipelineCharts'
import { estimateDealValue } from '@/lib/crm-utils'

const STAGES = [
  { key: 'new', label: '🔥 New', color: 'bg-slate-500/20 text-slate-300', bar: '#64748b' },
  { key: 'contacted', label: '📞 Contacted', color: 'bg-blue-500/20 text-blue-300', bar: '#3b82f6' },
  { key: 'demo', label: '💻 Demo Sent', color: 'bg-violet-500/20 text-violet-300', bar: '#8b5cf6' },
  { key: 'negotiation', label: '🤝 Negotiation', color: 'bg-amber-500/20 text-amber-300', bar: '#f59e0b' },
  { key: 'won', label: '🎉 Won', color: 'bg-emerald-500/20 text-emerald-300', bar: '#10b981' },
  { key: 'lost', label: '❌ Lost', color: 'bg-red-500/20 text-red-300', bar: '#ef4444' },
]

let activityId = 0
function makeEvent(type, message) {
  activityId += 1
  return { id: activityId, type, message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
}

export default function CRM() {
  const [leads, setLeads] = useState([])
  const [dragging, setDragging] = useState(null)
  const [hoverStage, setHoverStage] = useState(null)
  const [activeLead, setActiveLead] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [events, setEvents] = useState([])

  // Filters
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [minScore, setMinScore] = useState(0)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const r = await api('/leads')
      setLeads(r.leads || [])
    } catch (e) {
      toast.error(e.message)
    }
  }

  function pushEvent(type, message) {
    setEvents((evs) => [makeEvent(type, message), ...evs].slice(0, 30))
  }

  async function moveTo(lead, stage) {
    if (lead.stage === stage) return
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, stage } : l)))

    try {
      await api(`/leads/${lead.id}`, { method: 'PATCH', body: { stage } })
      toast.success(`Moved to ${stage}`)
      pushEvent('moved', `Moved ${lead.business?.name} to ${stage}`)
    } catch (e) {
      toast.error(e.message)
      load()
    }
  }

  async function toggleFavorite(lead) {
    const favorite = !lead.favorite
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, favorite } : l)))
    try {
      await api(`/leads/${lead.id}`, { method: 'PATCH', body: { favorite } })
      pushEvent('saved', `${favorite ? 'Favorited' : 'Unfavorited'} ${lead.business?.name}`)
    } catch (e) {
      toast.error(e.message)
      load()
    }
  }

  async function rescore(lead) {
    try {
      const r = await api(`/leads/${lead.id}/score`, { method: 'POST' })
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, score: r.score } : l)))
      toast.success('AI score updated')
      pushEvent('scored', `AI re-scored ${lead.business?.name}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  function handleUpdatedLead(updated) {
    setLeads((ls) => ls.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)))
  }

  const filteredLeads = useMemo(() => {
    let result = [...leads]

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((l) => {
        const b = l.business || {}
        return (
          b.name?.toLowerCase().includes(q) ||
          b.phone?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.website?.toLowerCase().includes(q) ||
          l.stage?.toLowerCase().includes(q)
        )
      })
    }

    if (minScore > 0) {
      result = result.filter((l) => (l.score?.score ?? 0) >= minScore)
    }

    if (favoritesOnly) {
      result = result.filter((l) => l.favorite)
    }

    const dealValueOf = (l) => l.dealValue ?? (l.score?.score != null ? estimateDealValue(l.score.score) : 0)

    switch (sort) {
      case 'score':
        result.sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0))
        break
      case 'rating':
        result.sort((a, b) => (b.business?.rating ?? 0) - (a.business?.rating ?? 0))
        break
      case 'recent-contact':
        result.sort((a, b) => new Date(b.lastContact || 0) - new Date(a.lastContact || 0))
        break
      case 'value':
        result.sort((a, b) => dealValueOf(b) - dealValueOf(a))
        break
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }

    return result
  }, [leads, query, minScore, favoritesOnly, sort])

  const stats = useMemo(() => {
    const won = leads.filter((l) => l.stage === 'won')
    return {
      total: leads.length,
      contacted: leads.filter((l) => l.stage === 'contacted').length,
      meetings: leads.filter((l) => l.stage === 'negotiation' || l.stage === 'demo').length,
      won: won.length,
      revenue: won.reduce((sum, l) => sum + (l.dealValue ?? estimateDealValue(l.score?.score ?? 0)), 0),
      aiOpportunities: leads.filter((l) => (l.score?.score ?? 0) >= 55).length,
    }
  }, [leads])

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
            CRM Pipeline
          </h1>
          <p className="text-muted-foreground mt-2">Drag leads through your sales pipeline.</p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <PipelineCharts leads={leads} />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        minScore={minScore}
        onMinScoreChange={setMinScore}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
        resultCount={filteredLeads.length}
      />

      <div className="grid xl:grid-cols-[1fr_280px] gap-6">
        {/* Kanban */}
        <div className="flex gap-5 overflow-x-auto pb-6 -mx-1 px-1 snap-x snap-mandatory">
          {STAGES.map((stage) => {
            const items = filteredLeads.filter((l) => (l.stage || 'new') === stage.key)
            const isHover = hoverStage === stage.key

            return (
              <div
                key={stage.key}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoverStage(stage.key)
                }}
                onDragLeave={() => setHoverStage((s) => (s === stage.key ? null : s))}
                onDrop={() => {
                  if (dragging) moveTo(dragging, stage.key)
                  setHoverStage(null)
                }}
                className={`w-[300px] md:w-[340px] shrink-0 snap-start rounded-2xl border backdrop-blur-xl p-3 min-h-[650px] transition-colors ${
                  isHover
                    ? 'border-violet-500/50 bg-violet-500/[0.06] shadow-[0_0_30px_rgba(124,58,237,0.15)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-center mb-4 sticky top-0 z-10 backdrop-blur-xl bg-inherit rounded-xl px-1 py-1.5">
                  <h2 className="font-semibold text-sm">{stage.label}</h2>
                  <Badge className={`${stage.color} border-0`}>{items.length}</Badge>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onOpen={(l) => {
                          setActiveLead(l)
                          setSheetOpen(true)
                        }}
                        onDragStart={setDragging}
                        onDragEnd={() => setDragging(null)}
                        onToggleFavorite={toggleFavorite}
                        onRescore={rescore}
                      />
                    ))}
                  </AnimatePresence>

                  {items.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-12 border border-dashed border-white/10 rounded-xl">
                      Drop Leads Here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Activity feed */}
        <div className="hidden xl:block">
          <ActivityFeed events={events} />
        </div>
      </div>

      <LeadDetailSheet
        lead={activeLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={handleUpdatedLead}
      />

      {/* Mobile floating add button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_8px_30px_rgba(124,58,237,0.5)] flex items-center justify-center z-20"
        onClick={() => toast.info('Use lead search to save a new lead')}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  )
}