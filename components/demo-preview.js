'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { Rocket, Loader2, Star, ExternalLink, Phone, Mail, MapPin, Check } from 'lucide-react'

function Icon({ name, className }) {
  const C = Icons[name] || Icons.Sparkles
  return <C className={className} />
}

export default function DemoPreview({ business, demo, demoId }) {
  const [deploying, setDeploying] = useState(false)
  const [deployment, setDeployment] = useState(null)

  const primary = demo.brand?.primaryColor || '#7C3AED'
  const accent = demo.brand?.accentColor || '#3B82F6'

  async function deploy() {
    setDeploying(true)
    toast.loading('Publishing to GitHub + Vercel…', { id: 'dep' })
    try {
      const res = await api('/deployments', { method: 'POST', body: { business, demoId } })
      setDeployment(res)
      toast.success('Building deployment… will be live shortly (mock)', { id: 'dep' })
    } catch (e) { toast.error(e.message, { id: 'dep' }) } finally { setDeploying(false) }
  }

  return (
    <div className="bg-white text-slate-900" style={{ ['--brand']: primary, ['--accent']: accent }}>
      {/* Deploy bar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">{demo.brand?.vibe || 'modern'}</Badge>
          <span className="text-xs text-slate-500">Live preview — branded for {business.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {deployment && (
            <a href={deployment.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> {deployment.liveUrl}
            </a>
          )}
          <Button size="sm" onClick={deploy} disabled={deploying || !!deployment} style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: 'white' }} className="border-0">
            {deploying ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : deployment ? <Check className="h-3.5 w-3.5 mr-1" /> : <Rocket className="h-3.5 w-3.5 mr-1" />}
            {deployment ? 'Deployed (mock)' : 'Deploy to Vercel'}
          </Button>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(1200px 400px at 10% 10%, ${primary}30, transparent), radial-gradient(1000px 400px at 90% 90%, ${accent}30, transparent)` }} />
        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="mb-4 border-0" style={{ background: `${primary}20`, color: primary }}>{demo.brand?.tagline}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{demo.hero?.headline}</h1>
            <p className="mt-4 text-lg text-slate-600">{demo.hero?.subheadline}</p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" style={{ background: primary, color: 'white' }} className="border-0 hover:opacity-90">{demo.hero?.ctaPrimary}</Button>
              <Button size="lg" variant="outline">{demo.hero?.ctaSecondary}</Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
              <span>Trusted by {business.reviewCount}+ happy customers</span>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: `0 30px 60px -20px ${primary}40` }}>
            <img src={business.category === 'restaurant' || business.category === 'cafe' ? 'https://images.pexels.com/photos/31071253/pexels-photo-31071253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' : business.category === 'salon' ? 'https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' : 'https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'} alt={business.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>About us</div>
          <h2 className="text-3xl font-bold">{demo.about?.title}</h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">{demo.about?.body}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>What we offer</div>
          <h2 className="text-3xl font-bold">Services</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(demo.services || []).map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-6 rounded-2xl border hover:shadow-lg transition-all">
              <div className="h-11 w-11 rounded-xl grid place-items-center mb-4" style={{ background: `${primary}18`, color: primary }}>
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16" style={{ background: `linear-gradient(135deg, ${primary}08, ${accent}08)` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-2">
            {(demo.features || []).map((f, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: primary, color: 'white' }}>
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">{f.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>Loved by locals</div>
          <h2 className="text-3xl font-bold">What people say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(demo.testimonials || []).map((t, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-white">
              <div className="flex gap-1 mb-3">{[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-slate-700">“{t.quote}”</p>
              <div className="mt-4 text-sm"><div className="font-semibold">{t.name}</div><div className="text-slate-500">{t.role}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-10">Questions</h2>
        <div className="space-y-3">
          {(demo.faq || []).map((f, i) => (
            <details key={i} className="group rounded-xl border p-5 open:shadow-sm">
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="transition-transform group-open:rotate-45 text-slate-400 text-xl">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">{demo.cta?.headline}</h2>
          <Button size="lg" className="mt-6 bg-white text-slate-900 hover:bg-white/90 border-0">{demo.cta?.button}</Button>
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6 text-sm text-slate-600">
        {demo.contact?.address && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.address}</div></div>}
        {demo.contact?.phone && <div className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.phone}</div></div>}
        {demo.contact?.email && <div className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.email}</div></div>}
      </footer>
      <div className="text-center pb-6 text-xs text-slate-400">Generated by AgencyOS AI · Powered by Gemini 2.5 Flash</div>
    </div>
  )
}
