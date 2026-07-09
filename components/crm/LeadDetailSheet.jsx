'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { api } from '@/lib/api'
import { buildTimeline, deriveOpportunityTags, estimateDealValue, formatINR, priorityFromScore } from '@/lib/crm-utils'

export default function LeadDetailSheet({ lead, open, onOpenChange, onUpdated }) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [followUp, setFollowUp] = useState('')

  useEffect(() => {
    setNotes(lead?.notes || '')
    setFollowUp(lead?.nextFollowUp || '')
  }, [lead])

  if (!lead) return null

  const b = lead.business || {}
  const score = lead.score?.score ?? null
  const timeline = buildTimeline(lead)
  const tags = deriveOpportunityTags(lead)
  const priority = score != null ? priorityFromScore(score) : null
  const dealValue = lead.dealValue ?? (score != null ? estimateDealValue(score) : null)

  // Auto-save notes, debounced. Uses the existing PATCH /leads/:id endpoint —
  // no new routes, just an additional field in the same payload shape.
  const saveField = async (patch) => {
    setSaving(true)
    try {
      await api(`/leads/${lead.id}`, { method: 'PATCH', body: patch })
      onUpdated?.({ ...lead, ...patch })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-[#0f0b1a]/95 backdrop-blur-2xl border-white/10">
        <SheetHeader>

  <SheetTitle className="flex items-center gap-2">

    {b.name}

    {priority && (

      <Badge
        variant="outline"
        className={`text-[10px] ${priority.color}`}
      >
        {priority.label}
      </Badge>

    )}

  </SheetTitle>

  <SheetDescription>

    AI insights, timeline, notes and follow-up for this lead.

  </SheetDescription>

</SheetHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{b.city}</span>
            {b.category && <span>· {b.category}</span>}
            {dealValue != null && (
              <Badge className="bg-amber-500/15 text-amber-300 border-0">Est. {formatINR(dealValue)}</Badge>
            )}
          </div>

          {lead.score?.summary && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="flex items-center gap-1 text-xs font-medium text-violet-300 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Summary
              </p>
              <p className="text-sm text-muted-foreground">{lead.score.summary}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Timeline</h4>
            <div className="relative pl-5 space-y-4">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
              {timeline.map((step, i) => (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex items-start gap-3"
                >
                  <span className="absolute -left-5 top-0.5">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/20" />
                    )}
                  </span>
                  <div>
                    <p className={`text-sm ${step.done ? '' : 'text-muted-foreground'}`}>{step.label}</p>
                    {step.timestamp && <p className="text-[11px] text-muted-foreground">{step.timestamp}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Next Follow-up
            </h4>
            <Input
              type="date"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              onBlur={() => saveField({ nextFollowUp: followUp })}
              className="bg-white/5 border-white/10"
            />
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Notes</h4>
              <span className="text-[11px] text-muted-foreground">{saving ? 'Saving…' : 'Auto-saved'}</span>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveField({ notes })}
              placeholder="Add a note about this lead…"
              className="min-h-[100px] bg-white/5 border-white/10"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}