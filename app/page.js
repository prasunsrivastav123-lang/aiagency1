'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Search, Sparkles, Rocket, MessageSquare, BarChart3, Zap, Check, Bot, Globe, Users, TrendingUp } from 'lucide-react'

const features = [
  { icon: Search, title: 'Lead Finder', desc: 'Search local businesses by city, category, rating & digital presence — in seconds.' },
  { icon: Sparkles, title: 'AI Opportunity Score', desc: 'Gemini-powered scoring so you know which leads are worth chasing.' },
  { icon: Rocket, title: 'One-Click Demos', desc: 'Generate a full branded demo website for any lead. Wow them before you pitch.' },
  { icon: Globe, title: 'Auto-Deploy', desc: 'Push to GitHub + Vercel and get a live URL to show the prospect.' },
  { icon: MessageSquare, title: 'AI Outreach', desc: 'Personalized cold emails referencing the demo you built for them.' },
  { icon: BarChart3, title: 'CRM & Analytics', desc: 'Kanban pipeline, conversion, revenue — built for agencies.' },
]

const logos = ['Linear', 'Vercel', 'Stripe', 'Notion', 'Framer', 'Anthropic', 'OpenAI', 'Perplexity']

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">AgencyOS AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm" className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0">Get started <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 mesh-bg">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-violet-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 bg-blue-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 backdrop-blur bg-background/50">
              <Sparkles className="h-3 w-3 mr-1" /> Powered by Gemini 2.5 Flash
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Find local businesses.<br />
              <span className="gradient-text">Score them. Close them.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AgencyOS AI is the operating system for modern web agencies. Discover leads, generate AI demo sites in one click, and close deals— all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register"><Button size="lg" className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-lg shadow-violet-500/30">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link href="/dashboard"><Button size="lg" variant="outline">See it live →</Button></Link>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">No credit card required • Cancel anytime</div>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-20 relative">
            <div className="absolute inset-x-0 -bottom-4 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border bg-card/80 backdrop-blur shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className="h-8 flex items-center gap-1.5 px-4 border-b bg-muted/40">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/70"></div>
                <div className="mx-auto text-xs text-muted-foreground">app.agencyos.ai/dashboard</div>
              </div>
              <img src="https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Dashboard" className="w-full aspect-video object-cover opacity-90" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="border-y bg-muted/20 py-8 overflow-hidden">
        <div className="container">
          <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-wider">Loved by agencies who ship like</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {logos.map(l => <div key={l} className="text-lg font-semibold tracking-tight">{l}</div>)}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need to <span className="gradient-text">close more clients</span></h2>
            <p className="mt-4 text-muted-foreground text-lg">From lead discovery to deployed demo, AgencyOS AI automates the boring parts so you can focus on closing.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/60 bg-card/50 hover:bg-card hover:shadow-lg hover:shadow-violet-500/5 transition-all group">
                  <CardContent className="pt-6">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                      <f.icon className="h-5 w-5 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="relative rounded-3xl border overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-transparent p-12 md:p-20 text-center">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to <span className="gradient-text">10x your agency pipeline?</span></h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Join early access. Discover leads, generate demos, close deals — all before your coffee cools.</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register"><Button size="lg" className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link href="/dashboard"><Button size="lg" variant="outline">Explore demo</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 mt-12">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div>© 2025 AgencyOS AI</div>
          <div className="flex gap-4"><a href="#" className="hover:text-foreground">Privacy</a><a href="#" className="hover:text-foreground">Terms</a></div>
        </div>
      </footer>
    </div>
  )
}
