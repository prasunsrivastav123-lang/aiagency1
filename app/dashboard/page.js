'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Users, Sparkles, Rocket, TrendingUp, ArrowUpRight, Zap, ArrowRight, CheckCircle2, CircleDashed, MoreHorizontal } from 'lucide-react'
import { api } from '@/lib/api'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import AIInsights from '@/components/dashboard/AIInsights'

const STAT_STYLES = {
  violet: { shell: 'bg-violet-500/10', icon: 'text-violet-500' },
  blue: { shell: 'bg-blue-500/10', icon: 'text-blue-500' },
}

function Stat({ icon: Icon, label, value, delta, color = 'violet' }) {
  const style = STAT_STYLES[color] || STAT_STYLES.violet
  return (
    <Card className="border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-3xl font-bold mt-2 tracking-tight tabular-nums">{value}</div>
            {delta && <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{delta}</div>}
          </div>
          <div className={`h-10 w-10 rounded-xl ${style.shell} grid place-items-center`}>
            <Icon className={`h-5 w-5 ${style.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Overview() {
  const [stats, setStats] = useState({ leadsSaved: 0, demos: 0, deployments: 0, hotLeads: 0, trend: [] })

  useEffect(() => {
    api('/stats').then(setStats).catch(() => {})
  }, [])

  const hasActivity = stats.trend?.length > 0
  const setupSteps = [
    { label: 'Find businesses in your niche', href: '/dashboard/leads', complete: stats.leadsSaved > 0 },
    { label: 'Generate a tailored demo', href: '/dashboard/leads', complete: stats.demos > 0 },
    { label: 'Launch your outreach', href: '/dashboard/outreach', complete: false },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-600 dark:text-violet-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Agency workspace</div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Good to see you.</h1>
          <p className="text-muted-foreground text-sm mt-2">Here’s what’s moving across your agency today.</p>
        </div>
        <Link href="/dashboard/leads">
          <Button className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20">
            <Search className="h-4 w-4 mr-2" /> Find new leads
          </Button>
        </Link>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-violet-500/15 bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent shadow-lg shadow-violet-500/5">
          <div className="absolute inset-0 grid-bg opacity-25" />
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <CardContent className="relative p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-background/50 px-3 py-1 text-xs font-semibold text-violet-600 backdrop-blur dark:text-violet-300"><Sparkles className="h-3.5 w-3.5" /> Your next best action</div>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold">Find your next high-intent lead</h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">Search a city and category, score every business with AI, then create a tailored demo in a single workflow.</p>
            </div>
            <Link href="/dashboard/leads"><Button size="lg" className="shrink-0 bg-foreground text-background shadow-lg hover:bg-foreground/90">Find leads <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Leads Saved" value={stats.leadsSaved} delta="+12% this week" color="violet" />
        <Stat icon={Zap} label="Hot Leads" value={stats.hotLeads} delta="score ≥ 70" color="blue" />
        <Stat icon={Sparkles} label="Demos Generated" value={stats.demos} delta="AI-powered" color="violet" />
        <Stat icon={Rocket} label="Deployments" value={stats.deployments} delta="live on Vercel" color="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold">Pipeline activity</div>
                <div className="text-xs text-muted-foreground">Last 14 days</div>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="h-52">
              {hasActivity ? <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trend}>
                  <defs>
                    <linearGradient id="lead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(262 90% 66%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(262 90% 66%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="msg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 65%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(217 91% 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="leads" stroke="hsl(262 90% 66%)" fill="url(#lead)" strokeWidth={2} />
                  <Area type="monotone" dataKey="messages" stroke="hsl(217 91% 65%)" fill="url(#msg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer> : <div className="grid h-full place-items-center rounded-xl border border-dashed bg-muted/20 text-center">
                <div><CircleDashed className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm font-medium">Your activity will appear here</p><p className="mt-1 text-xs text-muted-foreground">Save leads or run outreach to start tracking momentum.</p></div>
              </div>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="font-semibold mb-4">Quick actions</div>
            <div className="space-y-2">
              <Link href="/dashboard/leads"><Button variant="outline" className="w-full justify-start"><Search className="h-4 w-4 mr-2" /> Find local businesses</Button></Link>
              <Link href="/dashboard/crm"><Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2" /> Open pipeline</Button></Link>
              <Link href="/dashboard/deployments"><Button variant="outline" className="w-full justify-start"><Rocket className="h-4 w-4 mr-2" /> View deployments</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIInsights stats={stats} />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="mb-5 flex items-center justify-between"><div><div className="font-semibold">Get your first result</div><p className="mt-1 text-xs text-muted-foreground">A simple workflow to turn a search into a new opportunity.</p></div><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></div>
          <div className="grid gap-3 md:grid-cols-3">
            {setupSteps.map((step, index) => <Link key={step.label} href={step.href} className="group rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5">
              <div className="flex items-start gap-3"><div className="mt-0.5">{step.complete ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <span className="grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold text-muted-foreground">{index + 1}</span>}</div><div><div className="text-sm font-medium group-hover:text-violet-600 dark:group-hover:text-violet-300">{step.label}</div><div className="mt-1 text-xs text-muted-foreground">{step.complete ? 'Completed' : 'Continue'} <ArrowRight className="inline h-3 w-3" /></div></div></div>
            </Link>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
