'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { ExternalLink, Github, Rocket, Loader2, CheckCircle2 } from 'lucide-react'

export default function Deployments() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const load = () => api('/deployments').then(r => setRows(r.deployments)).catch(() => {})
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground text-sm mt-1">Live demo sites you've deployed for prospects. (MOCK — wire your GitHub PAT & Vercel token in <code className="bg-muted px-1 rounded text-xs">route.js</code>)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(d => (
          <Card key={d.id} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{d.business?.name}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <Badge variant="outline" className={d.status === 'ready' ? 'border-emerald-500/40 text-emerald-500' : 'border-amber-500/40 text-amber-500'}>
                  {d.status === 'ready' ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Ready</> : <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Building</>}
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                <a href={d.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-violet-400">
                  <Rocket className="h-4 w-4" /> {d.liveUrl} <ExternalLink className="h-3 w-3" />
                </a>
                <a href={d.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Github className="h-4 w-4" /> {d.repoUrl}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">No deployments yet. Generate a demo and deploy it from the Lead Finder.</CardContent>
        </Card>
      )}
    </div>
  )
}
