'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Search, MapPin, Phone, Globe, Instagram, Facebook, Star, Sparkles, Loader2, ExternalLink, Rocket, Save, Zap, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { CATEGORIES } from '@/lib/mock-leads'
import DemoPreview from '@/components/demo-preview'

function ScoreRing({ score }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-violet-500' : score >= 40 ? 'text-amber-500' : 'text-slate-400'
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} strokeWidth="8" className="stroke-muted fill-none" />
        <circle cx="50" cy="50" r={r} strokeWidth="8" strokeLinecap="round" className={`${color} fill-none transition-all duration-1000`} strokeDasharray={c} strokeDashoffset={offset} stroke="currentColor" />
      </svg>
      <div className={`absolute inset-0 grid place-items-center ${color}`}>
        <div className="text-2xl font-bold">{score}</div>
      </div>
    </div>
  )
}

function LeadCard({ lead, onScore, onGenerateDemo, onSave, score, scoring, generating }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="border-border/60 hover:border-violet-500/40 transition-all group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{lead.name}</h3>
                {!lead.website && <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">No website</Badge>}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3 w-3" /> {lead.address}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {lead.rating} · {lead.reviewCount}</div>
                {lead.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone.slice(0,17)}</div>}
                {lead.hasInstagram && <Instagram className="h-3 w-3" />}
                {lead.hasFacebook && <Facebook className="h-3 w-3" />}
                {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><Globe className="h-3 w-3" /> site</a>}
              </div>
            </div>
            {score && (
              <div className="shrink-0 text-center">
                <ScoreRing score={score.score} />
                <Badge className={`mt-1 text-[10px] uppercase ${score.verdict === 'on-fire' ? 'bg-red-500/20 text-red-400 border-red-500/30' : score.verdict === 'hot' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : score.verdict === 'warm' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} border`} variant="outline">{score.verdict}</Badge>
              </div>
            )}
          </div>

          <AnimatePresence>
            {score && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 border-t pt-4 space-y-3">
                <p className="text-sm">{score.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(score.breakdown || {}).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={v} className="h-1.5" />
                        <span className="text-xs font-mono">{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                  <div className="text-[10px] uppercase text-violet-400 font-semibold tracking-wider mb-1">Pitch angle</div>
                  <p className="text-sm italic">“{score.pitchAngle}”</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(score.opportunities || []).map(o => <Badge key={o} variant="secondary" className="text-xs font-normal">✨ {o}</Badge>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap gap-2">
            {!score ? (
              <Button size="sm" onClick={() => onScore(lead)} disabled={scoring} className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0">
                {scoring ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                Score with AI
              </Button>
            ) : (
              <Button size="sm" onClick={() => onGenerateDemo(lead)} disabled={generating} className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0">
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Rocket className="h-3.5 w-3.5 mr-2" />}
                Generate demo site
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onSave(lead, score)}><Save className="h-3.5 w-3.5 mr-2" />Save to CRM</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function LeadFinder() {
  const [city, setCity] = useState('Austin')
  const [category, setCategory] = useState('restaurant')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState({}) // { leadId: scoreObj }
  const [scoring, setScoring] = useState({}) // { leadId: bool }
  const [generating, setGenerating] = useState({})
  const [demo, setDemo] = useState(null) // { demo, business, id }
  const [demoOpen, setDemoOpen] = useState(false)

  async function search() {
    if (!city.trim()) return toast.error('Enter a city')
    setLoading(true)
    setScores({})
    try {
      const res = await api('/leads/search', { method: 'POST', body: { city: city.trim(), category, limit: 12 } })
      setLeads(res.leads)
      toast.success(`Found ${res.count} businesses`)
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }

  async function scoreLead(lead) {
    setScoring(s => ({ ...s, [lead.id]: true }))
    try {
      const res = await api('/leads/score', { method: 'POST', body: { business: lead } })
      setScores(sc => ({ ...sc, [lead.id]: res }))
    } catch (e) { toast.error(e.message) } finally { setScoring(s => ({ ...s, [lead.id]: false })) }
  }

  async function scoreAll() {
    for (const l of leads) {
      if (!scores[l.id]) await scoreLead(l)
    }
  }

  async function generateDemo(lead) {
    setGenerating(g => ({ ...g, [lead.id]: true }))
    toast.loading('Gemini is designing the demo…', { id: 'gen' })
    try {
      const res = await api('/demo/generate', { method: 'POST', body: { business: lead } })
      setDemo(res)
      setDemoOpen(true)
      toast.success('Demo ready!', { id: 'gen' })
    } catch (e) { toast.error(e.message, { id: 'gen' }) } finally { setGenerating(g => ({ ...g, [lead.id]: false })) }
  }

  async function saveLead(lead, score) {
    try {
      await api('/leads', { method: 'POST', body: { business: lead, score } })
      toast.success('Saved to CRM')
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Finder</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover local businesses and let AI score their opportunity.</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Austin, Miami, Bangalore)" className="pl-9" onKeyDown={e => e.key === 'Enter' && search()} />
            </div>
            <div className="md:w-56">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={search} disabled={loading} className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
            {leads.length > 0 && (
              <Button variant="outline" onClick={scoreAll}><Zap className="h-4 w-4 mr-2" />Score all with AI</Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            Using curated mock dataset. Wire up your Google Places API key later in <code className="bg-muted px-1 rounded">/lib/mock-leads.js</code>.
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {leads.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {leads.map(l => (
              <LeadCard key={l.id} lead={l} score={scores[l.id]} scoring={scoring[l.id]} generating={generating[l.id]} onScore={scoreLead} onGenerateDemo={generateDemo} onSave={saveLead} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {leads.length === 0 && !loading && (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 grid place-items-center mb-4">
              <Search className="h-6 w-6 text-violet-500" />
            </div>
            <h3 className="font-semibold text-lg">Start by searching</h3>
            <p className="text-muted-foreground text-sm mt-1">Type a city + category and hit Search to discover businesses.</p>
          </CardContent>
        </Card>
      )}

      {/* Demo preview dialog */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-6xl h-[92vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b bg-background/80 backdrop-blur">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI-generated demo for {demo?.business?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-auto">
            {demo && <DemoPreview business={demo.business} demo={demo.demo} demoId={demo.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
