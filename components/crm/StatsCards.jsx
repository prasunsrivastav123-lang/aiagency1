'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, CalendarCheck2, Trophy, DollarSign, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatINR } from '@/lib/crm-utils'

function CountUp({ value, prefix = '', duration = 0.8 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const from = display
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{prefix}{display.toLocaleString('en-IN')}</>
}

const CARD_DEFS = [
  { key: 'total', label: 'Total Leads', icon: Users, from: '#7c3aed', to: '#4f46e5' },
  { key: 'contacted', label: 'Contacted', icon: TrendingUp, from: '#3b82f6', to: '#06b6d4' },
  { key: 'meetings', label: 'Meetings', icon: CalendarCheck2, from: '#8b5cf6', to: '#6366f1' },
  { key: 'won', label: 'Won Deals', icon: Trophy, from: '#10b981', to: '#059669' },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, from: '#f59e0b', to: '#ea580c', isCurrency: true },
  { key: 'aiOpportunities', label: 'AI Opportunities', icon: Sparkles, from: '#ec4899', to: '#8b5cf6' },
]

export default function StatsCards({ stats, trends = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARD_DEFS.map((def, i) => {
        const Icon = def.icon
        const value = stats[def.key] ?? 0
        const trend = trends[def.key]

        return (
          <motion.div
            key={def.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="relative rounded-2xl p-[1px] overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${def.from}, ${def.to}, transparent)` }}
          >
            <div className="rounded-2xl bg-[#0f0b1a]/90 backdrop-blur-xl p-4 h-full">
              <div className="flex items-start justify-between">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${def.from}33, ${def.to}33)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: def.from }} />
                </div>

                {typeof trend === 'number' && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3">{def.label}</p>
              <h3 className="text-2xl font-bold mt-0.5 tabular-nums">
                <CountUp value={value} prefix={def.isCurrency ? '₹' : ''} />
              </h3>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export { formatINR }