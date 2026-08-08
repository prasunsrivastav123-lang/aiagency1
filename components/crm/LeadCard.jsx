'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  MapPin,
  Star,
  Phone,
  Globe,
  MessageCircle,
  Mail,
  Navigation,
  Copy,
  Heart,
  Sparkles,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ScoreRing from './ScoreRing'
import { deriveOpportunityTags, estimateDealValue, formatINR, priorityFromScore } from '@/lib/crm-utils'
import SearchContextBadge from '@/components/shared/SearchContextBadge'

function IconAction({ icon: Icon, label, onClick, href, loading, tone = 'default' }) {
  const [busy, setBusy] = useState(false)
  const toneClass =
    tone === 'brand'
      ? 'hover:bg-violet-500/20 hover:text-violet-300'
      : tone === 'green'
      ? 'hover:bg-emerald-500/20 hover:text-emerald-300'
      : 'hover:bg-white/10'

  const handleClick = async (e) => {
    e.stopPropagation()
    if (!onClick) return
    setBusy(true)
    try {
      await onClick()
    } finally {
      setBusy(false)
    }
  }

  const Wrapper = href ? 'a' : 'button'

  return (
    <Wrapper
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onClick={href ? (e) => e.stopPropagation() : handleClick}
      title={label}
      className={`group relative h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground transition-all ${toneClass} disabled:opacity-50`}
      disabled={busy || loading}
    >
      {busy || loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </Wrapper>
  )
}

export default function LeadCard({ lead, onOpen, onDragStart, onDragEnd, onToggleFavorite, onRescore }) {
  const router = useRouter()
  const b = lead.business || {}
  const score = lead.score?.score ?? null
  const dealValue = lead.dealValue ?? (score != null ? estimateDealValue(score) : null)
  const priority = score != null ? priorityFromScore(score) : null
  const tags = deriveOpportunityTags(lead)
  const summary = lead.score?.summary || lead.aiSummary

  const copyPhone = async () => {
    if (!b.phone) return
    await navigator.clipboard.writeText(b.phone)
    toast.success('Phone number copied')
  }

  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart?.(lead)}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.04, rotate: -1, boxShadow: '0 20px 40px rgba(124,58,237,0.35)' }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Card
        onClick={() => onOpen?.(lead)}
        className="relative overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(124,58,237,0.15)] transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 opacity-70" />

        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{b.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{b.city}{b.category ? ` · ${b.category}` : ''}</span>
              </p>
              <SearchContextBadge leadId={lead.id} className="mt-2" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(lead)
                }}
                title={lead.favorite ? 'Unfavorite' : 'Favorite'}
              >
                <Heart className={`h-4 w-4 transition-colors ${lead.favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground hover:text-rose-400'}`} />
              </button>
              {score != null && <ScoreRing score={score} />}
            </div>
          </div>

          {/* Rating + priority + deal value */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {b.rating || 'N/A'}
              {b.reviewCount ? <span className="text-muted-foreground">({b.reviewCount})</span> : null}
            </span>
            {priority && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priority.color}`}>
                {priority.label} Priority
              </Badge>
            )}
            {dealValue != null && (
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-300 border-0">
                Est. {formatINR(dealValue)}
              </Badge>
            )}
          </div>

          {/* AI summary */}
          {summary && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-medium text-violet-300 mb-1">
                <Sparkles className="h-3 w-3" /> AI Summary
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3">{summary}</p>
            </div>
          )}

          {/* Opportunity tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-white/5">
            <span>{lead.lastContact ? `Last: ${lead.lastContact}` : 'Not contacted yet'}</span>
            {lead.nextFollowUp && <span className="text-blue-300">Next: {lead.nextFollowUp}</span>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-0.5">
              {b.phone && <IconAction icon={Phone} label="Call" href={`tel:${b.phone}`} tone="green" />}
              {b.phone && <IconAction icon={MessageCircle} label="WhatsApp" href={`https://wa.me/${b.phone.replace(/\D/g, '')}`} tone="green" />}
              {b.email && <IconAction icon={Mail} label="Email" href={`mailto:${b.email}`} />}
              {b.website && <IconAction icon={Globe} label="Website" href={b.website} tone="brand" />}
              {b.address && <IconAction icon={Navigation} label="Open Maps" href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`} />}
              {b.phone && <IconAction icon={Copy} label="Copy Phone" onClick={copyPhone} />}
            </div>
            <IconAction icon={RefreshCw} label="Score Again" onClick={() => onRescore?.(lead)} tone="brand" />
            <IconAction icon={FileText} label="Generate Proposal" onClick={() => router.push(`/dashboard/proposals?leadId=${encodeURIComponent(lead.id)}`)} tone="brand" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
