'use client'

import { useMemo, useState } from 'react'
import { Switch } from '@/components/ui/switch'

const INITIAL_STEPS = [
  { id: 'intro', label: 'Intro', delayDays: 0, message: '', active: true },
  { id: 'followup', label: 'Follow-up', delayDays: 1, message: '', active: true },
  { id: 'final', label: 'Final reminder', delayDays: 3, message: '', active: true },
]

export default function MultiStepBuilder({ initialMessage = '' }) {
  const [steps, setSteps] = useState(() => INITIAL_STEPS.map((step, index) => ({ ...step, message: index === 0 ? initialMessage : '' })))
  const error = useMemo(() => steps.some((step, index) => step.active && (!step.message.trim() || step.message.length > 1024 || (index > 0 && step.delayDays < steps[index - 1].delayDays))), [steps])
  return <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-3"><h3 className="text-sm font-semibold text-white">Campaign sequence</h3><p className="text-xs text-white/45">Draft follow-ups without losing them when a step is disabled.</p></div><div className="space-y-3">{steps.map((step) => <div key={step.id} className="rounded-xl border border-white/10 p-3"><div className="flex items-center justify-between"><label className="text-sm text-white">{step.label} · day {step.delayDays}</label><Switch checked={step.active} onCheckedChange={(active) => setSteps((items) => items.map((item) => item.id === step.id ? { ...item, active } : item))} /></div><textarea disabled={!step.active} value={step.message} maxLength={1025} onChange={(event) => setSteps((items) => items.map((item) => item.id === step.id ? { ...item, message: event.target.value } : item))} placeholder="Write this step…" className="mt-2 min-h-16 w-full rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-white disabled:opacity-40" /><div className="mt-1 text-right text-[10px] text-white/40">{step.message.length}/1024</div></div>)}</div>{error && <p className="mt-3 text-xs text-amber-300">Each active step needs a message, must be under 1024 characters, and delays must stay in order.</p>}</section>
}
