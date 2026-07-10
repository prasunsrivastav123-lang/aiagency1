'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Icons from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import {
Rocket,
Loader2,
Star,
ExternalLink,
Phone,
Mail,
MapPin,
Check,
Menu,
X,
ArrowDown,
MessageCircle,
Globe
} from "lucide-react";

function Icon({ name, className }) {
  const C = Icons[name] || Icons.Sparkles
  return <C className={className} />
}

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

/* ---------------------------------------------------------------------- */
/*  PHASE 1 — Premium glass navbar                                        */
/*  Sticky + blur, smooth scroll, active-section highlight, mobile        */
/*  hamburger, CTA button. Deploy button moved in here unchanged.         */
/* ---------------------------------------------------------------------- */
function Navbar({ business, demo, deploying, deployment, onDeploy }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)

  const primary = demo.brand?.primaryColor || '#7C3AED'
  const accent = demo.brand?.accentColor || '#3B82F6'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(15,23,42,0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 8px 30px -12px rgba(15,23,42,0.15)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => scrollTo('home')} className="flex items-center gap-2.5 shrink-0">
          <motion.span
            whileHover={{ rotate: -6, scale: 1.05 }}
            className="h-9 w-9 rounded-xl grid place-items-center text-white font-bold text-sm shadow-md"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {business?.name?.[0]?.toUpperCase() || 'A'}
          </motion.span>
          <span className="font-semibold text-slate-900 hidden sm:inline">{business?.name}</span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, id }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="relative px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span style={{ color: isActive ? primary : undefined }}>{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute left-3.5 right-3.5 -bottom-0.5 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right side: deploy status + deploy button + CTA + hamburger */}
        <div className="flex items-center gap-2">
          {deployment && (
            <a
              href={deployment.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex text-xs text-slate-500 hover:text-slate-900 items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> {deployment.liveUrl}
            </a>
          )}

          <Button
            size="sm"
            onClick={onDeploy}
            disabled={deploying || !!deployment}
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: 'white' }}
            className="border-0 hidden sm:inline-flex"
          >
            {deploying ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : deployment ? (
              <Check className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Rocket className="h-3.5 w-3.5 mr-1" />
            )}
            {deployment ? 'Deployed (mock)' : 'Deploy to Vercel'}
          </Button>

          <Button size="sm" variant="outline" onClick={() => scrollTo('contact')} className="hidden md:inline-flex">
            {demo.hero?.ctaPrimary || 'Contact Us'}
          </Button>

          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t bg-white/95 backdrop-blur"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, id }) => {
                const isActive = active === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-left py-2.5 text-sm font-medium text-slate-700"
                    style={{ color: isActive ? primary : undefined }}
                  >
                    {label}
                  </button>
                )
              })}

              <Button
                size="sm"
                onClick={onDeploy}
                disabled={deploying || !!deployment}
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: 'white' }}
                className="border-0 mt-3"
              >
                {deploying ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : deployment ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Rocket className="h-3.5 w-3.5 mr-1" />
                )}
                {deployment ? 'Deployed (mock)' : 'Deploy to Vercel'}
              </Button>

              <Button size="sm" variant="outline" onClick={() => scrollTo('contact')} className="mt-2">
                {demo.hero?.ctaPrimary || 'Contact Us'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
function phoneLink(phone=""){

return `tel:${phone}`

}

function whatsappLink(phone="",name=""){

const p=phone.replace(/\D/g,"")

return `https://wa.me/${p}?text=${encodeURIComponent(
`Hi ${name},

I visited your website and would like to know more.`
)}`

}

function mapLink(address=""){

return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

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
    } catch (e) {
      toast.error(e.message, { id: 'dep' })
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="bg-white text-slate-900" style={{ ['--brand']: primary, ['--accent']: accent }}>
      {/* PHASE 1: premium glass navbar replaces the old plain deploy bar */}
      <Navbar business={business} demo={demo} deploying={deploying} deployment={deployment} onDeploy={deploy} />

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(1200px 400px at 10% 10%, ${primary}30, transparent), radial-gradient(1000px 400px at 90% 90%, ${accent}30, transparent)` }} />
        <div
className="absolute h-72 w-72 rounded-full blur-3xl opacity-30 animate-pulse"
style={{
background:primary,
top:-80,
left:-80
}}
/>

<div
className="absolute h-80 w-80 rounded-full blur-3xl opacity-20 animate-pulse"
style={{
background:accent,
right:-120,
bottom:-120,
animationDelay:"1s"
}}
/>
        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="mb-4 border-0" style={{ background: `${primary}20`, color: primary }}>{demo.brand?.tagline}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{demo.hero?.headline}</h1>
            <p className="mt-4 text-lg text-slate-600">{demo.hero?.subheadline}</p>
            <div className="mt-10 flex flex-wrap gap-4">
<motion.div
  whileHover={{
    scale: 1.05,
    y: -3,
  }}
>
  <Button
    size="lg"
    style={{
      background: primary,
      color: "white",
    }}
    onClick={() =>
      window.open(
        whatsappLink(
          demo.contact?.phone,
          business.name
        ),
        "_blank"
      )
    }
  >
    <MessageCircle className="mr-2 h-5 w-5" />

    WhatsApp
  </Button>
</motion.div>
<motion.div
  whileHover={{
    scale: 1.05,
    y: -3,
  }}
>
  <Button
    size="lg"
    variant="outline"
    onClick={() =>
      window.open(
        phoneLink(demo.contact?.phone)
      )
    }
  >
    <Phone className="mr-2 h-5 w-5" />

    Call
  </Button>
</motion.div>
<motion.div
  whileHover={{
    scale: 1.05,
    y: -3,
  }}
>
  <Button
    size="lg"
    variant="outline"
    onClick={() =>
      window.open(
        phoneLink(demo.contact?.phone)
      )
    }
  >
    <Phone className="mr-2 h-5 w-5" />

    Location
  </Button>
</motion.div>

{demo.contact?.website &&

<Button
size="lg"
variant="outline"
onClick={()=>
window.open(
demo.contact.website,
"_blank"
)
}
>

<Globe className="mr-2 h-5 w-5"/>

Website

</Button>

}

</div>
<div className="grid grid-cols-3 gap-8 mt-12">
 
<div>

<div className="text-4xl font-bold">

4.9★

</div>

<div className="text-sm text-slate-500">

Customer Rating

</div>

</div>

<div>

<div className="text-4xl font-bold">

500+

</div>

<div className="text-sm text-slate-500">

Happy Clients

</div>

</div>

<div>

<div className="text-4xl font-bold">

24/7

</div>

<div className="text-sm text-slate-500">

Support

</div>

</div>

</div>


            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
              <span>Trusted by 500+ happy customers</span>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: `0 30px 60px -20px ${primary}40` }}>
            <motion.img
  initial={{
    scale: 1.15,
    opacity: 0,
  }}
  animate={{
    scale: 1,
    opacity: 1,
  }}
  transition={{
    duration: 1,
    ease: "easeOut",
  }}
  whileHover={{
    scale: 1.05,
  }}
  src={
    business.category === "restaurant" || business.category === "cafe"
      ? "https://images.pexels.com/photos/31071253/pexels-photo-31071253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      : business.category === "salon"
      ? "https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      : "https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  }
  alt={business.name}
  className="w-full h-full object-cover"
/>
          </div>
        </div>
        <motion.div

animate={{
y:[0,10,0]
}}

transition={{
repeat:Infinity,
duration:1.5
}}

className="absolute bottom-8 left-1/2 -translate-x-1/2"

>

<ArrowDown className="h-7 w-7 text-slate-500"/>

</motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>About us</div>
          <h2 className="text-3xl font-bold">{demo.about?.title}</h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">{demo.about?.body}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16 border-t">
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
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-16">
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
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t">
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
      <footer id="contact" className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6 text-sm text-slate-600">
        {demo.contact?.address && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.address}</div></div>}
        {demo.contact?.phone && <div className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.phone}</div></div>}
        {demo.contact?.email && <div className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5" style={{color:primary}} /><div>{demo.contact.email}</div></div>}
      </footer>
      <div className="text-center pb-6 text-xs text-slate-400">Generated by AgencyOS AI · Powered by Gemini 2.5 Flash</div>
    </div>
  )
}