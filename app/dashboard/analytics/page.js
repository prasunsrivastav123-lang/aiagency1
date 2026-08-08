'use client'

import { useCallback, useEffect, useState } from 'react'
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/Skeletons'

function Metric({ label, value, note }) {
  return <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"><div className="text-2xl font-bold tabular-nums">{value ?? '—'}</div><div className="mt-1 text-sm font-medium">{label}</div><div className="mt-1 text-xs text-emerald-500">{note}</div></div>
}

export default function AnalyticsPage() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null })
    try {
      const data = await api('/stats')
      setState(data ? { status: 'success', data, error: null } : { status: 'empty', data: null, error: null })
    } catch (error) {
      console.error('[Analytics] load failed:', error)
      setState({ status: 'error', data: null, error: 'We couldn’t load analytics right now.' })
    }
  }, [])
  useEffect(() => { load() }, [load])
  if (state.status === 'loading') return <div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
  if (state.status === 'error') return <EmptyState title="Analytics are unavailable" description={state.error} actionLabel="Try again" onAction={load} />
  if (state.status === 'empty') return <EmptyState title="No analytics yet" description="Save leads and start outreach to build your performance view." />
  const stats = state.data
  const highOpportunity = stats.hotLeads || 0
  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-500"><BarChart3 className="h-3.5 w-3.5" /> Performance workspace</div><h1 className="text-3xl font-bold">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">A concise view of the signals that move your agency forward.</p></div><Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Leads found" value={stats.leadsSaved || 0} note="Current workspace" /><Metric label="High-opportunity leads" value={highOpportunity} note="Ready for outreach" /><Metric label="Calls made" value={stats.callsMade ?? '—'} note="Connect calling data" /><Metric label="WhatsApp replies" value={stats.whatsappReplies ?? '—'} note="Connect campaign data" /></div><section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/12 via-fuchsia-500/5 to-transparent p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15"><TrendingUp className="h-5 w-5 text-violet-400" /></div><div><p className="text-sm font-semibold">AI insight</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{highOpportunity >= 3 ? `${highOpportunity} saved leads show strong opportunity signals. Prioritize businesses with no website, a high rating, and a reachable phone number for a website plus WhatsApp automation offer.` : 'More lead activity is needed before AgencyOS can identify a reliable high-conversion segment.'}</p></div></div></section><p className="text-xs text-muted-foreground">Future: Vercel Analytics, Sentry, PostHog, and revenue forecasting can be connected here without changing this UI.</p></div>
}
