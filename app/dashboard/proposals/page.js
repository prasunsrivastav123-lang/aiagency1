'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileDown, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { getSearchForLead } from '@/lib/searchContext'
import { generateProposalPDF } from '@/lib/proposals/pdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import EmptyState from '@/components/shared/EmptyState'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { SkeletonCard } from '@/components/shared/Skeletons'
import { toast } from 'sonner'

const SERVICES = ['Website', 'SEO', 'WhatsApp Automation', 'AI Calling', 'Full Digital Package']

function ProposalGenerator() {
  const searchParams = useSearchParams()
  const [state, setState] = useState({ status: 'loading', data: [], error: null })
  const [leadId, setLeadId] = useState(searchParams.get('leadId') || '')
  const [service, setService] = useState('')
  const [problems, setProblems] = useState('')
  const [generated, setGenerated] = useState(false)

  useEffect(() => { (async () => { try { const response = await api('/leads'); const leads = response?.leads || []; setState({ status: leads.length ? 'success' : 'empty', data: leads, error: null }) } catch (error) { console.error('[Proposals] load failed:', error); setState({ status: 'error', data: [], error: 'Couldn’t load saved leads.' }) } })() }, [])
  const lead = state.data.find((item) => item.id === leadId)
  useEffect(() => { if (!lead) return; const business = lead.business || {}; const context = getSearchForLead(lead.id); const items = [!business.website && 'No website found', Number(business.rating) > 0 && Number(business.rating) < 4.2 && 'Customer review opportunity', ...(context?.filters?.noWebsite ? ['Found through no-website search'] : [])].filter(Boolean); setProblems(items.join('\n')) }, [lead])
  const proposal = useMemo(() => { const business = lead?.business || {}; return { title: `${service || 'Digital Growth'} Proposal`, business: business.name || 'your business', sections: [{ title: 'Business overview', body: `${business.name || 'This business'} is ready for a clearer, higher-converting digital presence.` }, { title: 'Problems found', body: problems || 'Opportunities will be tailored after discovery.' }, { title: 'Proposed solution', body: `A focused ${service || 'digital growth'} package designed around measurable local growth.` }, { title: 'Deliverables', body: 'Strategy, implementation, launch support, and reporting.' }, { title: 'Timeline', body: 'A focused 2–4 week rollout, depending on scope.' }, { title: 'Pricing', body: 'A detailed investment estimate will follow your approval of scope.' }, { title: 'Next step', body: 'Reply to schedule a short discovery call and finalize the plan.' }] } }, [lead, service, problems])
  if (state.status === 'loading') return <SkeletonCard />
  if (state.status === 'error') return <EmptyState title="Couldn’t load saved leads" description={state.error} actionLabel="Try again" onAction={() => window.location.reload()} />
  if (state.status === 'empty') return <EmptyState title="No saved leads yet" description="Save a lead from Lead Finder before creating a proposal." />
  return <div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-bold">Proposal generator</h1><p className="mt-1 text-sm text-muted-foreground">Turn a lead’s context into a tailored, editable proposal.</p></div><div className="grid gap-6 lg:grid-cols-[340px_1fr]"><section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5"><label className="block text-sm font-medium">Lead<select value={leadId} onChange={(event) => { setLeadId(event.target.value); setGenerated(false) }} className="mt-1.5 w-full rounded-lg border bg-background p-2 text-sm"><option value="">Select a saved lead</option>{state.data.map((item) => <option key={item.id} value={item.id}>{item.business?.name || item.id}</option>)}</select></label><label className="block text-sm font-medium">Service<select value={service} onChange={(event) => { setService(event.target.value); setGenerated(false) }} className="mt-1.5 w-full rounded-lg border bg-background p-2 text-sm"><option value="">Select a service</option>{SERVICES.map((item) => <option key={item}>{item}</option>)}</select></label><Button className="w-full" disabled={!lead || !service} title={!lead || !service ? 'Choose a lead and service first' : undefined} onClick={() => setGenerated(true)}><Sparkles className="mr-2 h-4 w-4" /> Generate proposal</Button></section><section className="rounded-2xl border border-border/60 bg-card p-6">{generated ? <><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-violet-500">AGENCYOS AI · PROPOSAL</p><h2 className="mt-2 text-2xl font-bold">{proposal.title}</h2><p className="text-muted-foreground">Prepared for {proposal.business}</p></div><Button variant="outline" onClick={() => { if (!generateProposalPDF(proposal)) toast.error('Couldn’t open the print dialog. Please allow popups and try again.') }}><FileDown className="mr-2 h-4 w-4" /> Export PDF</Button></div><div className="mt-6 space-y-5">{proposal.sections.map((section) => <div key={section.title}><h3 className="font-semibold">{section.title}</h3>{section.title === 'Problems found' ? <textarea value={problems} onChange={(event) => setProblems(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border bg-background p-3 text-sm" /> : <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{section.body}</p>}</div>)}</div></> : <EmptyState title="Build a proposal preview" description="Choose a lead and a service, then generate a draft you can edit before exporting." />}</section></div></div>
}

export default function ProposalsPage() { return <ErrorBoundary><ProposalGenerator /></ErrorBoundary> }
