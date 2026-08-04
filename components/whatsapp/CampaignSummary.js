'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Timer, Sparkles, ShieldAlert, Reply, CalendarCheck } from 'lucide-react'

function useCountUp(target = 0, duration = 0.6) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const from = value
    function tick(now) {
      const progress = Math.min(1, (now - start) / (duration * 1000))
      setValue(Math.round(from + (target - from) * progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return value
}

function Stat({ icon: Icon, label, value, suffix = '', gradient }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-white font-semibold text-sm">
          {typeof value === 'number' ? animated : value}{suffix}
        </div>
        <div className="text-white/40 text-xs">{label}</div>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, gradient }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function CampaignSummary({
  recipients = 0,
  estimatedTime = '—',
  delaySeconds = 0,
  aiScore = 0,
  spamRisk = 0,
  predictedReplies = 0,
  predictedMeetings = 0,
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-5">
      <h3 className="text-xs uppercase tracking-wide text-white/40">Campaign Summary</h3>

      <div className="grid grid-cols-2 gap-4">
        <Stat icon={Users} label="Recipients" value={recipients} gradient="from-violet-500 to-blue-500" />
        <Stat icon={Clock} label="Est. Time" value={estimatedTime} gradient="from-blue-500 to-cyan-500" />
        <Stat icon={Timer} label="Delay" value={delaySeconds} suffix="s" gradient="from-fuchsia-500 to-violet-500" />
        <Stat icon={Reply} label="Predicted Replies" value={predictedReplies} gradient="from-emerald-500 to-teal-500" />
        <Stat icon={CalendarCheck} label="Predicted Meetings" value={predictedMeetings} gradient="from-amber-500 to-orange-500" />
      </div>

      <div className="space-y-3 pt-1">
        <ProgressRow label="AI Score" value={aiScore} gradient="from-violet-500 to-blue-500" />
        <ProgressRow label="Spam Risk" value={spamRisk} gradient={spamRisk >= 30 ? 'from-red-500 to-rose-500' : 'from-emerald-500 to-teal-500'} />
      </div>
    </div>
  )
}