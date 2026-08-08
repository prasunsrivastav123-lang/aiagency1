'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSearchForLead } from '@/lib/searchContext'

function relativeTime(timestamp) {
  const hours = Math.max(0, Math.floor((Date.now() - timestamp) / 3600000))
  return hours < 1 ? 'just now' : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
}

export default function SearchContextBadge({ leadId, className = '' }) {
  const router = useRouter()
  const context = getSearchForLead(leadId)
  if (!context) return null
  return <button type="button" title="Repeat this search" onClick={() => router.push(`/dashboard/leads?searchId=${encodeURIComponent(context.searchId)}`)} className={`inline-flex max-w-full items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-left text-[11px] text-violet-700 transition hover:bg-violet-500/15 dark:text-violet-200 ${className}`}><Search className="h-3 w-3 shrink-0" /><span className="truncate">Found via: {context.query}</span><span className="shrink-0 text-violet-500/80">· {relativeTime(context.timestamp)}</span></button>
}
