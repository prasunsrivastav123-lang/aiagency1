'use client'

// components/calling/CallScript.js
//
// Generates and renders the AI call script via POST /api/calls/script.
// The backend already handles Gemini failures with a local fallback and
// never returns an error for generation itself — this component simply
// renders whatever script object comes back.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Copy,
  Check,
  RotateCw,
  MessageSquareText,
  HelpCircle,
  Target,
  ShieldQuestion,
  Flag,
  Send,
} from 'lucide-react'

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
]
const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
]

function scriptToText(script) {
  if (!script) return ''
  const lines = []
  if (script.opening) lines.push(`Opening:\n${script.opening}`)
  if (script.painPoints?.length) lines.push(`Pain Points:\n${script.painPoints.map((p) => `- ${p}`).join('\n')}`)
  if (script.questions?.length) lines.push(`Questions:\n${script.questions.map((q) => `- ${q}`).join('\n')}`)
  if (script.pitch) lines.push(`Pitch:\n${script.pitch}`)
  if (script.objectionHandling?.length) {
    lines.push(
      `Objection Handling:\n${script.objectionHandling
        .map((o) => `- ${o.objection}: ${o.response}`)
        .join('\n')}`
    )
  }
  if (script.closing) lines.push(`Closing:\n${script.closing}`)
  if (script.followUp) {
    const fu = script.followUp
    lines.push(
      `Follow-up:\n${['day2', 'day5', 'day10', 'final']
        .filter((k) => fu[k])
        .map((k) => `- ${k}: ${fu[k]}`)
        .join('\n')}`
    )
  }
  return lines.join('\n\n')
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {children}
    </div>
  )
}

export default function CallScript({ lead, script, generating = false, onRegenerate }) {
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('english')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = scriptToText(script)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      // silent
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-white">AI Call Script</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  tone === t.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  language === l.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onRegenerate?.(lead, { tone, language })}
            disabled={generating || !lead}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:opacity-40"
          >
            <RotateCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
            {script ? 'Regenerate' : 'Generate'}
          </button>

          <button
            onClick={handleCopy}
            disabled={!script}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/20 disabled:opacity-40"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Script'}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-white/5" style={{ width: `${80 - i * 8}%` }} />
              ))}
            </motion.div>
          ) : !script ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-sm text-slate-500"
            >
              {lead ? 'Generate a script for this lead to see it here.' : 'Select a lead to generate a script.'}
            </motion.div>
          ) : (
            <motion.div
              key="script"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {script.opening && (
                <Section icon={MessageSquareText} title="Opening">
                  <p className="text-sm leading-relaxed text-slate-200">{script.opening}</p>
                </Section>
              )}

              {script.painPoints?.length > 0 && (
                <Section icon={Target} title="Pain Points">
                  <ul className="space-y-1.5">
                    {script.painPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {script.questions?.length > 0 && (
                <Section icon={HelpCircle} title="Questions">
                  <ul className="space-y-1.5">
                    {script.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {script.pitch && (
                <Section icon={Sparkles} title="Pitch">
                  <p className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm leading-relaxed text-slate-200">
                    {script.pitch}
                  </p>
                </Section>
              )}

              {script.objectionHandling?.length > 0 && (
                <Section icon={ShieldQuestion} title="Objection Handling">
                  <div className="space-y-2">
                    {script.objectionHandling.map((o, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-xs font-medium text-rose-300">"{o.objection}"</div>
                        <div className="mt-1 text-sm text-slate-200">{o.response}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {script.closing && (
                <Section icon={Flag} title="Closing">
                  <p className="text-sm leading-relaxed text-slate-200">{script.closing}</p>
                </Section>
              )}

              {script.followUp && (
                <Section icon={Send} title="Follow-up">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['day2', 'day5', 'day10', 'final'].map(
                      (k) =>
                        script.followUp[k] && (
                          <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">
                              {k === 'final' ? 'Final' : k.replace('day', 'Day ')}
                            </div>
                            <div className="mt-1 text-xs text-slate-200">{script.followUp[k]}</div>
                          </div>
                        )
                    )}
                  </div>
                </Section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
