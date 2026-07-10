'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
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
  Globe,
  Send,
  Quote,
  Sparkles,
  ShieldCheck,
  Camera,
  ChevronDown,
  Clock,
  BadgeCheck,
} from "lucide-react";

function Icon({ name, className }) {
  const C = Icons[name] || Icons.Sparkles
  return <C className={className} />
}

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

/* ---------------------------------------------------------------------- */
/*  Helpers (unchanged behaviour, contact links only — no backend calls)  */
/* ---------------------------------------------------------------------- */
function phoneLink(phone = "") {
  return `tel:${phone}`
}

function whatsappLink(phone = "", name = "", customMessage = "") {
  const p = phone.replace(/\D/g, "")
  const text = customMessage || `Hi ${name},\n\nI visited your website and would like to know more.`
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`
}

function mapLink(address = "") {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function mailLink(email = "", subject = "", body = "") {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/* ---------------------------------------------------------------------- */
/*  Category-aware imagery — hero shot + a small curated gallery set      */
/* ---------------------------------------------------------------------- */
function getCategoryImages(category) {
  const sets = {
    restaurant: {
      hero: "https://images.pexels.com/photos/31071253/pexels-photo-31071253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1100",
      gallery: [
        "https://images.pexels.com/photos/31071253/pexels-photo-31071253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
      ],
    },
    cafe: {
      hero: "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1100",
      gallery: [
        "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1002740/pexels-photo-1002740.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1187078/pexels-photo-1187078.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/226102/pexels-photo-226102.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
      ],
    },
    salon: {
      hero: "https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1100",
      gallery: [
        "https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
      ],
    },
    default: {
      hero: "https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1100",
      gallery: [
        "https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=700&w=900",
      ],
    },
  }
  return sets[category] || sets.default
}

/* ---------------------------------------------------------------------- */
/*  Animated counter — counts up once when scrolled into view             */
/* ---------------------------------------------------------------------- */
function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 1.6 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/* ---------------------------------------------------------------------- */
/*  Ambient particles — deterministic (no hydration mismatch)             */
/* ---------------------------------------------------------------------- */
function Particles({ primary, accent, count = 16 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const seed = i * 137.5
      return {
        left: ((Math.sin(seed) + 1) / 2) * 100,
        top: ((Math.cos(seed * 1.3) + 1) / 2) * 100,
        size: 4 + (i % 5) * 2,
        delay: (i % 8) * 0.4,
        duration: 6 + (i % 5),
        color: i % 2 === 0 ? primary : accent,
      }
    })
  }, [count, primary, accent])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.35,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  PHASE 1 — Premium glass navbar (+ scroll progress polish)             */
/* ---------------------------------------------------------------------- */
function Navbar({ business, demo, deploying, deployment, onDeploy }) {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)

  const primary = demo.brand?.primaryColor || '#7C3AED'
  const accent = demo.brand?.accentColor || '#3B82F6'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const h = document.documentElement
      const scrollable = h.scrollHeight - h.clientHeight
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0)
    }
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
      {/* scroll progress hairline */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-transparent">
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${primary}, ${accent})` }}
        />
      </div>

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

/* ---------------------------------------------------------------------- */
/*  Hero visual — mouse parallax tilt + floating glass cards              */
/* ---------------------------------------------------------------------- */
function HeroVisual({ business, demo, primary, accent, heroImg }) {
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mvY, [-50, 50], [7, -7]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mvX, [-50, 50], [-7, 7]), { stiffness: 150, damping: 20 })
  const imgRef = useRef(null)
  const [imgOk, setImgOk] = useState(true)

  const topTestimonial = demo.testimonials?.[0]

  function handleMouseMove(e) {
    const rect = imgRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 100
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 100
    mvX.set(relX)
    mvY.set(relY)
  }

  function handleMouseLeave() {
    mvX.set(0)
    mvY.set(0)
  }

  return (
    <div className="relative pb-6 pr-4 sm:pb-10 sm:pr-8">
      <motion.div
        ref={imgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
      >
        <div
          className="absolute inset-0"
          style={{ boxShadow: `0 30px 60px -20px ${primary}40`, zIndex: 1, pointerEvents: 'none' }}
        />
        {imgOk ? (
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            src={heroImg}
            alt={business.name}
            onError={() => setImgOk(false)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full grid place-items-center"
            style={{ background: `linear-gradient(135deg, ${primary}30, ${accent}30)` }}
          >
            <Sparkles className="h-10 w-10" style={{ color: primary }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </motion.div>

      {/* Floating Google reviews badge */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -top-5 -right-3 sm:-right-6 z-10 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/60 px-3.5 py-2.5 flex items-center gap-2"
      >
        <div className="h-7 w-7 rounded-full grid place-items-center bg-white shadow-sm text-xs font-bold" style={{ color: '#4285F4' }}>
          G
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Google Reviews</div>
        </div>
      </motion.div>

      {/* Floating glass review card */}
      {topTestimonial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ y: -4 }}
          className="hidden sm:block absolute -left-6 -bottom-8 z-10 w-64 bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-4"
        >
          <Quote className="h-5 w-5 mb-1.5 opacity-70" style={{ color: primary }} />
          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{topTestimonial.quote}</p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full grid place-items-center text-white text-[10px] font-bold"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {topTestimonial.name?.[0] || '★'}
            </div>
            <div className="text-[11px] font-semibold text-slate-800">{topTestimonial.name}</div>
          </div>
        </motion.div>
      )}

      {/* Floating WhatsApp presence card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => window.open(whatsappLink(demo.contact?.phone, business.name), '_blank')}
        className="hidden lg:flex absolute -right-4 top-6 z-10 items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/60 px-3 py-2 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <span className="text-[11px] font-semibold text-slate-700">Usually replies instantly</span>
      </motion.div>
    </div>
  )
}

export default function DemoPreview({ business, demo, demoId }) {
  const [deploying, setDeploying] = useState(false)
  const [deployment, setDeployment] = useState(null)
  const [faqOpen, setFaqOpen] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const primary = demo.brand?.primaryColor || '#7C3AED'
  const accent = demo.brand?.accentColor || '#3B82F6'
  const images = getCategoryImages(business.category)

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

  function submitContactForm(e) {
    e.preventDefault()
    const msg = `Hi ${business.name}, my name is ${form.name || 'there'}.\n\n${form.message || "I'd like to know more."}\n\nYou can reach me at: ${form.phone}`
    window.open(whatsappLink(demo.contact?.phone, business.name, msg), '_blank')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const stats = [
    { value: 4.9, decimals: 1, suffix: '★', label: 'Customer Rating' },
    { value: 500, decimals: 0, suffix: '+', label: 'Happy Clients' },
    { value: 24, decimals: 0, suffix: '/7', label: 'Support' },
  ]

  return (
    <div className="bg-white text-slate-900" style={{ ['--brand']: primary, ['--accent']: accent }}>
      <style>{`
        @keyframes qbGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .qb-gradient-heading {
          background-size: 200% auto;
          animation: qbGradientMove 6s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* PHASE 1: premium glass navbar replaces the old plain deploy bar */}
      <Navbar business={business} demo={demo} deploying={deploying} deployment={deployment} onDeploy={deploy} />

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(1200px 400px at 10% 10%, ${primary}30, transparent), radial-gradient(1000px 400px at 90% 90%, ${accent}30, transparent)` }} />
        <div
          className="absolute h-72 w-72 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ background: primary, top: -80, left: -80 }}
        />
        <div
          className="absolute h-80 w-80 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: accent, right: -120, bottom: -120, animationDelay: '1s' }}
        />
        <Particles primary={primary} accent={accent} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 border-0" style={{ background: `${primary}20`, color: primary }}>
                <Sparkles className="h-3 w-3 mr-1 inline" />
                {demo.brand?.tagline}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight leading-tight qb-gradient-heading"
              style={{ backgroundImage: `linear-gradient(90deg, #0f172a, ${primary}, ${accent}, #0f172a)` }}
            >
              {demo.hero?.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg text-slate-600"
            >
              {demo.hero?.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  style={{ background: primary, color: 'white' }}
                  className="shadow-lg"
                  onClick={() => window.open(whatsappLink(demo.contact?.phone, business.name), '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => { window.location.href = phoneLink(demo.contact?.phone) }}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open(mapLink(demo.contact?.address || business.name), '_blank')}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </Button>
              </motion.div>

              {demo.contact?.website && (
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" onClick={() => window.open(demo.contact.website, '_blank')}>
                    <Globe className="mr-2 h-5 w-5" />
                    Website
                  </Button>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-3 gap-8 mt-12">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <div className="text-4xl font-bold">
                    <AnimatedCounter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>Trusted by 500+ happy customers</span>
            </div>
          </div>

          <HeroVisual business={business} demo={demo} primary={primary} accent={accent} heroImg={images.hero} />
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="h-7 w-7 text-slate-500" />
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>About us</div>
          <h2 className="text-3xl font-bold">{demo.about?.title}</h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">{demo.about?.body}</p>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16 border-t">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>What we offer</div>
          <h2 className="text-3xl font-bold">Services</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(demo.services || []).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl border hover:shadow-xl transition-all bg-white"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -4 }}
                className="h-11 w-11 rounded-xl grid place-items-center mb-4"
                style={{ background: `${primary}18`, color: primary }}
              >
                <Icon name={s.icon} className="h-5 w-5" />
              </motion.div>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4"
              >
                <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: primary, color: 'white' }}>
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">{f.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="max-w-6xl mx-auto px-6 py-16 border-t">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5" style={{ color: primary }}>
            <Camera className="h-4 w-4" /> A closer look
          </div>
          <h2 className="text-3xl font-bold">Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[140px] md:auto-rows-[160px]">
          {images.gallery.map((src, i) => (
            <GalleryTile key={i} src={src} index={i} primary={primary} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-16 border-t">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>Loved by locals</div>
          <h2 className="text-3xl font-bold">What people say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(demo.testimonials || []).map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="relative p-6 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all"
            >
              <div className="absolute -top-3 left-6 h-6 w-6 rounded-full grid place-items-center text-white" style={{ background: primary }}>
                <Quote className="h-3 w-3" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </div>
              </div>
              <p className="text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full grid place-items-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                >
                  {t.name?.[0] || '★'}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-slate-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-10">Questions</h2>
        <div className="space-y-3">
          {(demo.faq || []).map((f, i) => {
            const isOpen = faqOpen === i
            return (
              <div key={i} className="rounded-xl border overflow-hidden bg-white">
                <button
                  onClick={() => setFaqOpen(isOpen ? -1 : i)}
                  className="w-full text-left px-5 py-4 font-semibold flex items-center justify-between gap-4"
                >
                  <span>{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="h-4 w-4 shrink-0" style={{ color: isOpen ? primary : '#94a3b8' }} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-slate-600">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">{demo.cta?.headline}</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block mt-6">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90 border-0 shadow-xl"
              onClick={() => window.open(whatsappLink(demo.contact?.phone, business.name), '_blank')}
            >
              {demo.cta?.button}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-16 border-t">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>Get in touch</div>
          <h2 className="text-3xl font-bold">Contact us</h2>
        </div>
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact form */}
          <motion.form
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={submitContactForm}
            className="md:col-span-3 rounded-2xl border p-6 space-y-4 bg-white shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Your name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: `${primary}55` }}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Phone number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: `${primary}55` }}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ ['--tw-ring-color']: `${primary}55` }}
                placeholder="Tell us what you need…"
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" style={{ background: primary, color: 'white' }} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Send via WhatsApp
              </Button>
            </motion.div>
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium flex items-center gap-1.5"
                  style={{ color: primary }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" /> Opening WhatsApp with your message…
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 rounded-2xl p-6 text-white flex flex-col gap-5"
            style={{ background: `linear-gradient(160deg, ${primary}, ${accent})` }}
          >
            {demo.contact?.address && (
              <a
                href={mapLink(demo.contact.address)}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 hover:opacity-90"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{demo.contact.address}</span>
              </a>
            )}
            {demo.contact?.phone && (
              <a href={phoneLink(demo.contact.phone)} className="flex items-start gap-3 hover:opacity-90">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{demo.contact.phone}</span>
              </a>
            )}
            {demo.contact?.email && (
              <a href={mailLink(demo.contact.email)} className="flex items-start gap-3 hover:opacity-90">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-sm">{demo.contact.email}</span>
              </a>
            )}
            <div className="flex items-center gap-2 text-xs pt-2 border-t border-white/30 mt-1">
              <Clock className="h-3.5 w-3.5" /> Usually responds within the hour
            </div>
          </motion.div>
        </div>
      </section>

      <div className="text-center pb-6 text-xs text-slate-400">Generated by AgencyOS AI · Powered by Gemini 2.5 Flash</div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Gallery tile — bento layout, hover zoom, graceful image fallback      */
/* ---------------------------------------------------------------------- */
function GalleryTile({ src, index, primary }) {
  const [ok, setOk] = useState(true)
  const big = index === 0
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`relative rounded-xl overflow-hidden group ${big ? 'col-span-2 row-span-2' : ''}`}
    >
      {ok ? (
        <img
          src={src}
          alt=""
          onError={() => setOk(false)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full grid place-items-center" style={{ background: `${primary}15` }}>
          <Camera className="h-6 w-6" style={{ color: primary }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  )
}