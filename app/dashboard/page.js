'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Users, Sparkles, Rocket, TrendingUp, ArrowUpRight, Zap, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

function Stat({ icon: Icon, label, value, delta, color = 'violet' }) {
  return (
    <Card className="border-border/60">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-3xl font-bold mt-2 tracking-tight">{value}</div>
            {delta && <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{delta}</div>}
          </div>
          <div className={`h-10 w-10 rounded-lg bg-${color}-500/10 grid place-items-center`}>
            <Icon className={`h-5 w-5 text-${color}-500`} />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your agency at a glance.</p>
        </div>
        <Link href="/dashboard/leads">
          <Button className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20">
            <Search className="h-4 w-4 mr-2" /> Find new leads
          </Button>
        </Link>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <CardContent className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-violet-500 font-semibold mb-2">Aha moment</div>
              <h2 className="text-2xl md:text-3xl font-bold">Try the magic in 30 seconds</h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">Search a city + category, watch Gemini score every business, then generate a full branded demo site in one click.</p>
            </div>
            <Link href="/dashboard/leads"><Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">Start now <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
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
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold">Pipeline activity</div>
                <div className="text-xs text-muted-foreground">Last 14 days</div>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
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
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
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
    </div>
  )
}
