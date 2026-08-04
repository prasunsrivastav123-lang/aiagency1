'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, MapPin, Globe, Copy, MessageCircle, Sparkles, Send,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import LeadSelector from './LeadSelector'

const glass = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl'

const DEMO_VALUES = { name: 'Owner', business: 'Business' }

const SUGGESTIONS = [
  "Hi 👋 Didn't hear back. Would you like to see the free website demo?",
  'Call after 2 days',
  'Offer 10% launch discount',
  'Already have a website? Happy to show what we can add.',
]

const QUICK_ACTIONS = [
  { key: 'call', label: '📞 Call Owner' },
  { key: 'maps', label: '📍 Open Google Maps' },
  { key: 'website', label: '🌐 Visit Website' },
  { key: 'copy', label: '📋 Copy Message' },
  { key: 'whatsapp', label: '💬 Open WhatsApp' },
]

function validatePhone(value) {
  const cleaned = value.replace(/[^\d+]/g, '')
  const digits = cleaned.replace(/\+/g, '')
  if (!cleaned) return { valid: false, cleaned }
  if (digits.length < 10 || digits.length > 15) return { valid: false, cleaned }
  return { valid: true, cleaned }
}

// STEP 5: when a lead is selected, {{name}}/{{business}} resolve to the
// real owner + business name instead of the generic placeholders.
function fillTemplate(message, lead) {
  const name = lead?.owner || DEMO_VALUES.name
  const business = lead?.business || DEMO_VALUES.business
  return (message || '')
    .replace(/{{\s*name\s*}}/gi, name)
    .replace(/{{\s*business\s*}}/gi, business)
}

function scoreMessage(message = '') {
  const len = message.length
  const hasGreeting = /^(hi|hello|hey)/i.test(message.trim())
  const hasCTA = /(call|reply|demo|would you|can we|book|available)/i.test(message)
  const hasPersonalization = /{{\s*(name|business)\s*}}/i.test(message)
  const tooLong = len > 900

  let score = 40
  if (hasGreeting) score += 15
  if (hasCTA) score += 20
  if (hasPersonalization) score += 15
  if (len > 20 && len < 600) score += 10
  if (tooLong) score -= 20
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    tips: [
      { label: 'Personalised', ok: hasPersonalization },
      { label: 'CTA Included', ok: hasCTA },
      { label: 'Too Long', ok: !tooLong, warn: tooLong },
    ],
  }
}

function counterColor(len) {
  if (len >= 900) return 'text-red-400'
  if (len >= 600) return 'text-amber-400'
  return 'text-emerald-400'
}

export default function CreateCampaignDialog({ open = true, onClose, onCreated, apiBase, authHeaders, leads = [] }) {
  const [form, setForm] = useState({ name: '', audience: [], phone: '', message: '', delaySeconds: 8 })
  const [phoneError, setPhoneError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  const MAX_LEN = 1024
  const quality = useMemo(() => scoreMessage(form.message), [form.message])

  // STEP 4: selecting a lead auto-fills Campaign Name -> Phone -> Website ->
  // Owner -> City, and pre-writes a personalized opening message. Nothing
  // here requires typing; the user can still edit any field afterward.
  function handleSelectLead(lead) {
    setSelectedLead(lead)
    handlePhoneChange(lead.phone || '')
    setForm((f) => ({
      ...f,
      name: `${lead.category || 'Business'} ${lead.city || ''}`.trim(),
      audience: [lead],
      message:
        `Hi {{name}} 👋\n\n` +
        `I created a FREE website demo for {{business}}.\n\n` +
        `Would you like to see it?`,
    }))
  }

  function handlePhoneChange(value) {
    const { valid, cleaned } = validatePhone(value)
    setForm((f) => ({ ...f, phone: cleaned }))
    setPhoneError(value && !valid ? 'Enter 10–15 digits, digits and + only' : '')
  }

  function appendSuggestion(text) {
    setForm((f) => ({ ...f, message: f.message ? `${f.message}\n${text}` : text }))
  }

  function buildWaLink(number, message) {
    const digits = (number || '').replace(/\+/g, '')
    const text = encodeURIComponent(fillTemplate(message, selectedLead))
    return `https://wa.me/${digits}?text=${text}`
  }

  function openWhatsAppFallback() {
    if (!navigator.onLine) {
      toast.warning('No internet. Opening WhatsApp draft.')
    }
    const link = buildWaLink(form.phone, form.message)
    window.open(link, '_blank')
  }

  function handleQuickAction(key) {
    switch (key) {
      case 'call':
        if (form.phone) window.open(`tel:${form.phone}`, '_self')
        break
      case 'maps':
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(DEMO_VALUES.business)}`, '_blank')
        break
      case 'website':
        window.open('https://', '_blank')
        break
      case 'copy':
        navigator.clipboard?.writeText(fillTemplate(form.message, selectedLead))
        toast.success ? toast.success('Message copied') : toast('Message copied')
        break
      case 'whatsapp':
        openWhatsAppFallback()
        break
      default:
        break
    }
  }

  async function handleSendCampaign() {
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      let whatsappConnected = true
      try {
        const res = await fetch(`${apiBase || '/api'}/whatsapp/stats`, { headers: authHeaders?.() })
        const data = await res.json()
        whatsappConnected = !!data?.connected
      } catch {
        whatsappConnected = false
      }

      if (!navigator.onLine || !whatsappConnected) {
        if (!navigator.onLine) toast.warning('No internet. Opening WhatsApp draft.')
        openWhatsAppFallback()
        setSubmitting(false)
        return
      }

      const res = await fetch(`${apiBase || '/api'}/campaign/create`, {
        method: 'POST',
        headers: authHeaders?.() || { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          message: form.message,
          phone: form.phone,
          delaySeconds: Number(form.delaySeconds) || 8,
          audience: form.audience,
        }),
      })
      const data = await res.json()
      if (data?.campaign) onCreated?.(data.campaign)
      onClose?.()
    } catch (e) {
      console.error('Failed to send campaign', e)
      openWhatsAppFallback()
    } finally {
      setSubmitting(false)
    }
  }

  function estimatedSendLabel() {
    const delay = Number(form.delaySeconds) || 0
    const now = new Date()
    const sendAt = new Date(now.getTime() + delay * 1000)
    const isSameDay = sendAt.toDateString() === now.toDateString()
    if (delay <= 60 && isSameDay) return `Now + ${delay} sec`
    if (isSameDay) return `Today ${sendAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    return `Tomorrow ${sendAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className={`${glass} w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto`}
      >
        <h2 className="text-white font-medium text-lg mb-4">New WhatsApp Campaign</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Campaign Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. August Cold Outreach" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Audience</label>
              <div className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                {form.audience.length} recipient(s) selected
              </div>
            </div>

            {/* 1. Owner Phone Number */}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Owner WhatsApp Number</label>
              <Input value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91 9876543210" className="bg-white/5 border-white/10 text-white" />
              {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Message / Template</label>
              <textarea
                value={form.message}
                maxLength={MAX_LEN}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Hi {{name}}, I put together a free demo for {{business}}..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              {/* 6. Live Character Counter */}
              <div className={`text-right text-xs mt-1 ${counterColor(form.message.length)}`}>
                {form.message.length} / {MAX_LEN}
              </div>
            </div>

            {/* 2. Quick Actions */}
            <div>
              <label className="text-xs text-white/50 mb-2 block">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((qa) => (
                  <motion.button
                    key={qa.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction(qa.key)}
                    className="px-3 py-1.5 rounded-full text-xs text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {qa.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 5. AI Suggestions */}
            <div>
              <label className="text-xs text-white/50 mb-2 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Suggested Follow-ups
              </label>
              <div className="space-y-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => appendSuggestion(s)}
                    className="w-full text-left text-xs text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Delay Between Messages (seconds)</label>
              <Input type="number" value={form.delaySeconds} onChange={(e) => setForm({ ...form, delaySeconds: e.target.value })}
                className="bg-white/5 border-white/10 text-white" />
              {/* 7. Estimated Delivery */}
              <p className="text-xs text-white/40 mt-1">Estimated Send Time: <span className="text-white/70">{estimatedSendLabel()}</span></p>
            </div>

            {/* 8. AI Quality Score */}
            <div className={`${glass} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Message Quality</span>
                <span className="text-sm text-white font-medium">{quality.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                  animate={{ width: `${quality.score}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {quality.tips.map((tip) => (
                  <span key={tip.label} className={tip.warn ? 'text-amber-400' : tip.ok ? 'text-emerald-400' : 'text-white/30'}>
                    {tip.warn ? '⚠' : tip.ok ? '✓' : '·'} {tip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: 9. Better Phone Preview */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Live Preview</label>
              <div className="relative mx-auto w-full max-w-[240px] rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3">
                <div className="rounded-2xl bg-[#0b141a] overflow-hidden">
                  <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-medium">
                      {(selectedLead?.owner || DEMO_VALUES.name).charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">
                        {selectedLead?.business || DEMO_VALUES.business}
                      </div>
                      <div className="text-emerald-400 text-[10px]">Online</div>
                    </div>
                  </div>
                  <div className="p-3 h-56 flex flex-col justify-end gap-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${form.message}-${selectedLead?.id || 'demo'}`}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="self-end bg-emerald-600/80 text-white text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[90%] whitespace-pre-wrap"
                      >
                        {fillTemplate(form.message, selectedLead) || 'Your message preview appears here...'}
                        <div className="text-[9px] text-white/60 text-right mt-1">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="px-3 py-1.5 text-[10px] text-white/30 border-t border-white/5">
                    {form.phone ? form.phone : '+91 •••• •••• ••'} · Last seen just now
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-2 block">Select a Lead</label>
              <LeadSelector leads={leads} selectedLead={selectedLead} onSelectLead={handleSelectLead} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose} className="text-white/60">Cancel</Button>
          {/* 10. Manual WhatsApp Button */}
          <Button
            onClick={openWhatsAppFallback}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-xl"
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Open WhatsApp
          </Button>
          <Button
            disabled={submitting}
            onClick={handleSendCampaign}
            className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white rounded-xl"
          >
            <Send className="w-4 h-4 mr-2" /> {submitting ? 'Sending…' : 'Send Campaign'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}