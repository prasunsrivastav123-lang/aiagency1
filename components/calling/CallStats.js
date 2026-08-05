'use client'

// components/calling/CallStats.js
//
// Displays: Today's Calls, Weekly Calls, Interested, Follow Ups, Missed,
// Meetings, Conversion %, Average Duration.
// Data comes exclusively from GET /api/calls/stats (passed in as `stats`
// by app/dashboard/calling/page.js) — no numbers are fabricated here.

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneCall,
  CalendarRange,
  ThumbsUp,
  Clock3,
  PhoneMissed,
  CalendarCheck2,
  TrendingUp,
  Timer,
} from 'lucide-react'
import { formatDuration } from '@/lib/calling/analytics'

function AnimatedNumber({ value = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(value) || 0
    const duration = 700
    const start = performance.now()

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span>
      {Number.isInteger(value) ? Math.round(display) : display.toFixed(0)}
      {suffix}
    </span>
  )
}

const CARD_DEFS = [
  {
    key: 'callsToday',
    label: "Today's Calls",
    icon: PhoneCall,
    accent: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
  {
    key: 'callsThisWeek',
    label: 'Weekly Calls',
    icon: CalendarRange,
    accent: 'from-fuchsia-500 to-violet-500',
    glow: 'shadow-fuchsia-500/20',
  },
  {
    key: 'interested',
    label: 'Interested',
    icon: ThumbsUp,
    accent: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    key: 'followUp',
    label: 'Follow Ups',
    icon: Clock3,
    accent: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
  {
    key: 'missed',
    label: 'Missed',
    icon: PhoneMissed,
    accent: 'from-rose-500 to-red-500',
    glow: 'shadow-rose-500/20',
  },
  {
    key: 'meetings',
    label: 'Meetings',
    icon: CalendarCheck2,
    accent: 'from-purple-500 to-indigo-500',
    glow: 'shadow-purple-500/20',
  },
  {
    key: 'conversion',
    label: 'Conversion %',
    icon: TrendingUp,
    accent: 'from-violet-500 to-fuchsia-500',
    glow: 'shadow-violet-500/20',
    suffix: '%',
  },
  {
    key: 'avgDuration',
    label: 'Avg Duration',
    icon: Timer,
    accent: 'from-indigo-500 to-purple-500',
    glow: 'shadow-indigo-500/20',
    format: 'duration',
  },
]

export default function CallStats({ stats, loading = false }) {
  const safeStats = stats || {}

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {CARD_DEFS.map((def, i) => {
        const Icon = def.icon
        const rawValue = safeStats[def.key] ?? 0

        return (
          <motion.div
            key={def.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}
            whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 shadow-lg ${def.glow}`}
          >
            <div
              className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${def.accent} opacity-20 blur-2xl`}
            />

            <div className="relative flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${def.accent} shadow-md`}
              >
                <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
              </div>
            </div>

            <div className="relative mt-4">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-white/10" />
                ) : def.format === 'duration' ? (
                  formatDuration(rawValue)
                ) : (
                  <AnimatedNumber value={rawValue} suffix={def.suffix || ''} />
                )}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
                {def.label}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
