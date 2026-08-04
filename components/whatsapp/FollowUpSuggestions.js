'use client'

import { motion } from 'framer-motion'
import { Briefcase, Smile, Tag, BellRing, CalendarCheck } from 'lucide-react'

const SUGGESTIONS = [
  {
    icon: Briefcase,
    label: 'Professional',
    text:
      "Hi {{name}}, I'd like to introduce a website + automation solution built specifically for {{business}}. Would you be open to a short call this week?",
  },
  {
    icon: Smile,
    label: 'Friendly',
    text: "Hi {{name}} 👋 I made a free demo website for {{business}} — want to take a quick look?",
  },
  {
    icon: Tag,
    label: 'Discount',
    text: "Hi {{name}}, we're offering 10% off for {{business}} this month if you sign up for a new website + WhatsApp automation. Interested?",
  },
  {
    icon: BellRing,
    label: 'Reminder',
    text: "Hi {{name}}, just following up — did you get a chance to look at the demo I sent for {{business}}?",
  },
  {
    icon: CalendarCheck,
    label: 'Book Call',
    text: "Hi {{name}}, would you have 10 minutes this week for a quick call about growing {{business}} online?",
  },
]

export default function FollowUpSuggestions({ onInsert }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <h3 className="text-xs uppercase tracking-wide text-white/40 mb-3">Suggested Follow-ups</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.label}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onInsert?.(s.text)}
            className="text-left rounded-xl p-3 border border-white/10 bg-gradient-to-br from-violet-500/10 to-blue-500/10 hover:from-violet-500/20 hover:to-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
                <s.icon className="w-3.5 h-3.5 text-white" />
              </span>
              <span className="text-white text-xs font-medium">{s.label}</span>
            </div>
            <p className="text-white/50 text-[11px] leading-snug line-clamp-2">{s.text}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}