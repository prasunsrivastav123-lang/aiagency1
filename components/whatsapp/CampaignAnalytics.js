'use client'

import EmptyState from '@/components/shared/EmptyState'

export default function CampaignAnalytics({ campaigns = [] }) {
  if (!campaigns.length) return <EmptyState title="No campaign data yet" description="Create a campaign to start tracking delivery and reply performance." />
  const totals = campaigns.reduce((result, item) => ({ sent: result.sent + (item.sent || item.messagesSent || 0), delivered: result.delivered + (item.delivered || 0), read: result.read + (item.read || 0), replies: result.replies + (item.replies || 0), interested: result.interested + (item.interested || 0) }), { sent: 0, delivered: 0, read: 0, replies: 0, interested: 0 })
  const metrics = [['Sent', totals.sent], ['Delivered', totals.delivered], ['Read', totals.read], ['Replied', totals.replies], ['Interested', totals.interested], ['Conversion', totals.sent ? `${Math.round((totals.interested / totals.sent) * 100)}%` : '—']]
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><div className="text-lg font-semibold text-white">{value}</div><div className="text-xs text-white/45">{label}</div></div>)}</div>
}
