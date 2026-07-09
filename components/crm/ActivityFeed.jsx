'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Sparkles, Save, ArrowRightLeft, Send } from 'lucide-react'

const ICONS = {
  saved: Save,
  moved: ArrowRightLeft,
  scored: Sparkles,
  demo: Send,
  default: Activity,
}

export default function ActivityFeed({ events = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 h-fit sticky top-4">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
        <Activity className="h-4 w-4 text-violet-400" /> Activity
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No activity yet</p>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const Icon = ICONS[ev.type] || ICONS.default
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 text-xs"
                >
                  <span className="mt-0.5 h-6 w-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3 w-3 text-violet-300" />
                  </span>
                  <div>
                    <p className="text-muted-foreground leading-snug">{ev.message}</p>
                    <p className="text-[10px] text-white/30">{ev.time}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}