'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Plus, Send, Users, Reply, TrendingUp,
  FileText, Contact, Zap, Phone, Check, CheckCheck, Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getSelectedLead, clearSelectedLead } from '@/lib/whatsapp/selectedLead'
import TemplateLibrary from '@/components/whatsapp/TemplateLibrary'
import { SkeletonCard } from '@/components/shared/Skeletons'

const CreateCampaignDialog = dynamic(() => import('@/components/whatsapp/CreateCampaignDialog'), { ssr: false, loading: () => <SkeletonCard /> })
const CampaignAnalytics = dynamic(() => import('@/components/whatsapp/CampaignAnalytics'), { ssr: false, loading: () => <SkeletonCard /> })
const MultiStepBuilder = dynamic(() => import('@/components/whatsapp/MultiStepBuilder'), { ssr: false, loading: () => <SkeletonCard /> })

const API = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api` : '/api'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

const glass = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl'

function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={`${glass} p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-sm text-white/50 mt-1">{label}</div>
    </motion.div>
  )
}

const statusStyles = {
  running: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

export default function WhatsAppPage() {
  const [stats, setStats] = useState({ connected: false, phoneNumber: null, campaigns: 0, messagesSent: 0, delivered: 0, replies: 0, responseRate: 0 })
  const [campaigns, setCampaigns] = useState([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  // Coming from Lead Finder's "WhatsApp Campaign" button — open the dialog
  // pre-filled with that business instead of a blank form.
  useEffect(() => {
    const lead = getSelectedLead()
    if (lead) {
      setSelectedCampaign({
        business: lead.name,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
        rating: lead.rating,
        email: lead.email,
        whatsapp: lead.whatsapp,
      })
      setShowBuilder(true)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, campaignsRes] = await Promise.all([
          fetch(`${API}/whatsapp/stats`, { headers: authHeaders() }).then(r => r.json()),
          fetch(`${API}/campaigns`, { headers: authHeaders() }).then(r => r.json()),
        ])
        setStats(statsRes || {})
        setCampaigns(campaignsRes?.campaigns?.filter(c => c.channel === 'whatsapp') || [])
      } catch (e) {
        console.error('Failed to load WhatsApp data', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
            WhatsApp Automation
          </h1>
          <p className="text-white/50 mt-1">Send personalized WhatsApp campaigns to your leads.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-lg shadow-emerald-500/20 rounded-xl px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </motion.div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Phone} label="Connected Number" value={stats.connected ? (stats.phoneNumber || 'Connected') : 'Not connected'} gradient="from-emerald-500 to-teal-500" delay={0} />
        <StatCard icon={Zap} label="Campaigns" value={stats.campaigns ?? 0} gradient="from-violet-500 to-blue-500" delay={0.05} />
        <StatCard icon={Send} label="Messages Sent" value={stats.messagesSent ?? 0} gradient="from-blue-500 to-cyan-500" delay={0.1} />
        <StatCard icon={Reply} label="Replies" value={stats.replies ?? 0} gradient="from-fuchsia-500 to-violet-500" delay={0.15} />
        <StatCard icon={TrendingUp} label="Response Rate" value={`${stats.responseRate ?? 0}%`} gradient="from-amber-500 to-orange-500" delay={0.2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={`${glass} lg:col-span-2`}><CardContent className="p-5"><h2 className="mb-4 text-white font-medium">Campaign performance</h2><CampaignAnalytics campaigns={campaigns} /></CardContent></Card>
        <Card className={glass}><CardContent className="p-5"><h2 className="mb-4 text-white font-medium">Template library</h2><TemplateLibrary onSelect={() => setShowBuilder(true)} /></CardContent></Card>
      </div>

      {showBuilder && <MultiStepBuilder initialMessage={selectedCampaign?.message || ''} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={glass}>
            <CardContent className="p-5">
              <h2 className="text-white font-medium mb-4">Recent Campaigns</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-left border-b border-white/10">
                      <th className="pb-3 font-normal">Campaign Name</th>
                      <th className="pb-3 font-normal">Status</th>
                      <th className="pb-3 font-normal">Recipients</th>
                      <th className="pb-3 font-normal">Delivered</th>
                      <th className="pb-3 font-normal">Replies</th>
                      <th className="pb-3 font-normal">Created</th>
                      <th className="pb-3 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={7} className="py-6 text-center text-white/30">Loading campaigns…</td></tr>
                    )}
                    {!loading && campaigns.length === 0 && (
                      <tr><td colSpan={7} className="py-6 text-center text-white/30">No campaigns yet — create your first one.</td></tr>
                    )}
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 text-white/80 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3">
                          <Badge className={`border rounded-full px-2 py-0.5 text-xs capitalize ${statusStyles[c.status] || statusStyles.scheduled}`}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3">{c.recipientCount ?? 0}</td>
                        <td className="py-3">{c.delivered ?? 0}</td>
                        <td className="py-3">{c.replies ?? 0}</td>
                        <td className="py-3 text-white/50">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Phone Preview */}
        <div className="space-y-6">
          <Card className={glass}>
            <CardContent className="p-5 space-y-2">
              <h2 className="text-white font-medium mb-2">Quick Actions</h2>
              {[
                { icon: Plus, label: 'Create Campaign', onClick: () => setShowBuilder(true) },
                { icon: FileText, label: 'Templates' },
                { icon: Contact, label: 'Contacts' },
                { icon: Zap, label: 'Automation' },
              ].map((action, i) => (
                <motion.button
                  key={action.label}
                  whileHover={{ x: 4 }}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <action.icon className="w-4 h-4 text-violet-400" />
                  {action.label}
                </motion.button>
              ))}
            </CardContent>
          </Card>

          <PhonePreview />
        </div>
      </div>

      <AnimatePresence>
        {showBuilder && (
          <CreateCampaignDialog
            open={showBuilder}
            initialCampaign={selectedCampaign}
            onClose={() => {
              setShowBuilder(false)
              setSelectedCampaign(null)
              clearSelectedLead()
            }}
            onCreated={(c) => setCampaigns([c, ...campaigns])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PhonePreview() {
  return (
    <Card className={glass}>
      <CardContent className="p-5">
        <h2 className="text-white font-medium mb-4">Conversation Preview</h2>
        <div className="relative mx-auto w-full max-w-[240px] rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3">
          <div className="rounded-2xl bg-[#0b141a] p-3 h-72 flex flex-col justify-end gap-2 overflow-hidden">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="self-start bg-white/10 text-white/90 text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%]">
              Hi! I created a free website demo for your business 👋
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="self-end bg-emerald-600/80 text-white text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] flex items-center gap-1">
              Sounds interesting, send it over <CheckCheck className="w-3 h-3 text-sky-300" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
              className="self-start bg-white/10 text-white/90 text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/40" /> typing…
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignBuilder({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', message: '', delaySeconds: 8 })
  const [submitting, setSubmitting] = useState(false)

  async function handleStart() {
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/campaign/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          message: form.message,
          delaySeconds: Number(form.delaySeconds) || 8,
          audience: [], // TODO: wire up audience picker from saved leads
        }),
      })
      const data = await res.json()
      if (data?.campaign) onCreated(data.campaign)
      onClose()
    } catch (e) {
      console.error('Failed to create campaign', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className={`${glass} w-full max-w-lg p-6`}
      >
        <h2 className="text-white font-medium text-lg mb-4">New WhatsApp Campaign</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Campaign Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. August Cold Outreach" className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Message / Template</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Hi {{name}}, I put together a free demo for you..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Delay Between Messages (seconds)</label>
            <Input type="number" value={form.delaySeconds} onChange={(e) => setForm({ ...form, delaySeconds: e.target.value })}
              className="bg-white/5 border-white/10 text-white" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose} className="text-white/60">Cancel</Button>
          <Button
            disabled={submitting}
            onClick={handleStart}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-xl"
          >
            {submitting ? 'Starting…' : 'Start Campaign'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
