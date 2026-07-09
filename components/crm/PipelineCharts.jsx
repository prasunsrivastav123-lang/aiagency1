'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

const STAGE_COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

// Recharts' default tooltip renders plain black text with no dark-theme
// styling, so on this background it either looks blank or gets clipped at
// the card edge. This replaces it with a themed box and is reused by all
// three charts below.
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border border-white/10 bg-[#17122a] px-3 py-2 shadow-xl">
      {label && <p className="text-[11px] text-muted-foreground mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: entry.color || entry.payload?.fill || '#fff' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function PipelineCharts({ leads = [] }) {
  const funnelData = useMemo(() => {
    const stages = ['new', 'contacted', 'demo', 'negotiation', 'won']
    return stages.map((s, i) => ({
      name: s[0].toUpperCase() + s.slice(1),
      value: leads.filter((l) => (l.stage || 'new') === s).length,
      fill: STAGE_COLORS[i],
    }))
  }, [leads])

  const winRate = useMemo(() => {
    const closed = leads.filter((l) => l.stage === 'won' || l.stage === 'lost')
    const won = leads.filter((l) => l.stage === 'won').length
    const rate = closed.length ? Math.round((won / closed.length) * 100) : 0
    return [
      { name: 'Won', value: rate },
      { name: 'Rest', value: 100 - rate },
    ]
  }, [leads])

  const categoryData = useMemo(() => {
    const counts = {}
    leads.forEach((l) => {
      const cat = l.business?.category || 'Other'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [leads])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-2">Lead Funnel</h4>
          <ResponsiveContainer width="100%" height={180}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} allowEscapeViewBox={{ x: true, y: true }} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#fff" stroke="none" dataKey="name" fontSize={11} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-2">Win Rate</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={winRate} dataKey="value" innerRadius={45} outerRadius={65} startAngle={90} endAngle={-270}>
                <Cell fill="#10b981" />
                <Cell fill="rgba(255,255,255,0.08)" />
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} allowEscapeViewBox={{ x: true, y: true }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-2">Top Categories</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                wrapperStyle={{ zIndex: 50 }}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}