import { BrainCircuit, Sparkles } from 'lucide-react'

export default function AIInsights({ stats }) {
  const highIntent = Number(stats?.hotLeads || 0)
  const leads = Number(stats?.leadsSaved || 0)
  const metrics = [['Leads found', leads], ['High opportunity', highIntent], ['Demos', Number(stats?.demos || 0)], ['Deployments', Number(stats?.deployments || 0)]]
  const enoughData = leads >= 3 || highIntent >= 3
  return <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-5"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15"><BrainCircuit className="h-4 w-4 text-violet-400" /></div><div><h2 className="text-sm font-semibold">AI insights</h2><p className="text-xs text-muted-foreground">Based on your current workspace activity</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-xl bg-background/40 p-3"><div className="text-xl font-bold tabular-nums">{value}</div><div className="text-[11px] text-muted-foreground">{label}</div></div>)}</div><div className="mt-4 flex gap-2 rounded-xl border border-violet-500/15 bg-background/30 p-3 text-sm"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" /><p>{enoughData ? `${highIntent} high-opportunity leads are ready for personalized outreach. Start with businesses that have strong ratings and no website.` : 'Not enough data yet today. Save a few leads and AgencyOS will surface your best next opportunity.'}</p></div></div>
}
