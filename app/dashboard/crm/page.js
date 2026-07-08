'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { MapPin, Star } from 'lucide-react'

const STAGES = [
  { key: 'new', label: 'New', color: 'bg-slate-500/20 text-slate-300' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500/20 text-blue-300' },
  { key: 'replied', label: 'Replied', color: 'bg-cyan-500/20 text-cyan-300' },
  { key: 'interested', label: 'Interested', color: 'bg-violet-500/20 text-violet-300' },
  { key: 'meeting', label: 'Meeting', color: 'bg-amber-500/20 text-amber-300' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500/20 text-emerald-300' },
]

export default function CRM() {
  const [leads, setLeads] = useState([])
  const [dragging, setDragging] = useState(null)

  useEffect(() => { load() }, [])
  async function load() {
    try { const r = await api('/leads'); setLeads(r.leads) } catch (e) { toast.error(e.message) }
  }

  async function moveTo(lead, stage) {
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage } : l))
    try { await api(`/leads/${lead.id}`, { method: 'PATCH', body: { stage } }); toast.success(`Moved to ${stage}`) } catch (e) { toast.error(e.message); load() }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Pipeline</h1>
        <p className="text-muted-foreground text-sm mt-1">Drag leads between stages to update their status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {STAGES.map(stage => {
          const items = leads.filter(l => (l.stage || 'new') === stage.key)
          return (
            <div
              key={stage.key}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragging && moveTo(dragging, stage.key)}
              className="rounded-xl bg-muted/30 border border-border/60 p-3 min-h-[240px]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{stage.label}</div>
                <Badge className={`${stage.color} border-0 text-[10px]`}>{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map(l => (
                  <motion.div key={l.id} layout draggable onDragStart={() => setDragging(l)} onDragEnd={() => setDragging(null)}>
                    <Card className="cursor-grab active:cursor-grabbing hover:border-violet-500/40 transition-colors">
                      <CardContent className="p-3">
                        <div className="font-medium text-sm truncate">{l.business?.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {l.business?.city}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {l.business?.rating}</div>
                          {l.score && <Badge variant="outline" className="text-[10px]">Score {l.score.score}</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground/60 text-center py-6">Drop here</div>}
              </div>
            </div>
          )
        })}
      </div>

      {leads.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">No saved leads yet. Head to <a href="/dashboard/leads" className="text-primary hover:underline">Lead Finder</a> to save some.</CardContent>
        </Card>
      )}
    </div>
  )
}
