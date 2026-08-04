'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

function analyzeMessage(message = '') {
  const len = message.length
  const hasGreeting = /^\s*(hi|hello|hey|namaste)/i.test(message)
  const hasCTA = /(call|reply|demo|would you|can we|book|available|interested|let me know)/i.test(message)
  const hasPersonalization = /{{\s*(name|business|owner)\s*}}/i.test(message)
  const idealLength = len >= 40 && len <= 500
  const capsRatio = message.replace(/[^A-Z]/g, '').length / Math.max(len, 1)
  const linkCount = (message.match(/https?:\/\//g) || []).length
  const spamWords = (message.match(/\b(free money|winner|click here|guarantee|100% free|act now)\b/gi) || []).length
  const spamRisk = Math.min(100, spamWords * 30 + (capsRatio > 0.3 ? 25 : 0) + (linkCount > 1 ? 20 : 0))

  let score = 30
  if (hasGreeting) score += 15
  if (hasCTA) score += 20
  if (hasPersonalization) score += 20
  if (idealLength) score += 15
  score -= Math.round(spamRisk * 0.3)
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    spamRisk,
    checklist: [
      { label: 'Greeting', ok: hasGreeting },
      { label: 'Call to Action', ok: hasCTA },
      { label: 'Personalization', ok: hasPersonalization },
      { label: 'Ideal Length', ok: idealLength },
      { label: 'Low Spam Risk', ok: spamRisk < 30 },
    ],
  }
}

function scoreColor(score) {
  if (score >= 75) return 'from-emerald-500 to-teal-500'
  if (score >= 45) return 'from-amber-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

export default function MessageScore({ message = '' }) {
  const { score, spamRisk, checklist } = useMemo(() => analyzeMessage(message), [message])

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">Message Quality</span>
        <motion.span
          key={score}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-white font-medium"
        >
          {score}%
        </motion.span>
      </div>

      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
        <motion.div
          className={`h-full bg-gradient-to-r ${scoreColor(score)}`}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-white/50">Spam Risk</span>
        <span className={spamRisk >= 30 ? 'text-red-400' : 'text-emerald-400'}>{spamRisk}%</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {checklist.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs"
          >
            <span className={item.ok ? 'text-emerald-400' : 'text-white/25'}>
              {item.ok ? '✓' : '○'}
            </span>
            <span className={item.ok ? 'text-white/70' : 'text-white/35'}>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}