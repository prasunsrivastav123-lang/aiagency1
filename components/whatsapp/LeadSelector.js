'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Phone, Globe, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

function StarRating({ rating = 0 }) {
  const full = Math.round(rating)
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {'★'.repeat(full)}
      <span className="text-white/20">{'★'.repeat(5 - full)}</span>
    </span>
  )
}

function LeadCard({ lead, isSelected, onSelectLead, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelectLead?.(lead)}
      className={`relative cursor-pointer rounded-xl p-4 border backdrop-blur-xl transition-colors ${
        isSelected
          ? 'bg-gradient-to-br from-violet-500/20 to-blue-500/20 border-violet-500/50 shadow-[0_0_24px_-4px_rgba(139,92,246,0.5)]'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-white text-sm font-medium truncate">{lead.business}</h3>
        <Badge
          className={`shrink-0 border rounded-full px-2 py-0.5 text-[10px] ${
            lead.hasWebsite
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
          }`}
        >
          {lead.hasWebsite ? 'Website' : 'Needs Website'}
        </Badge>
      </div>

      <p className="text-white/40 text-xs mb-2 truncate">{lead.owner}</p>

      <div className="flex items-center gap-3 text-xs text-white/50 mb-2 flex-wrap">
        <StarRating rating={lead.rating} />
        {lead.category && (
          <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[10px]">
            {lead.category}
          </span>
        )}
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {lead.city}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
        {lead.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> {lead.phone}
          </span>
        )}
        {lead.website && (
          <span className="flex items-center gap-1 truncate max-w-[140px]">
            <Globe className="w-3 h-3" /> {lead.website.replace(/^https?:\/\//, '')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function LeadSelector({ leads = [], selectedLead, onSelectLead }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((l) =>
      [l.owner, l.business, l.city, l.category].filter(Boolean).some((f) => f.toLowerCase().includes(q))
    )
  }, [leads, query])

  const grid = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
      {filtered.map((lead, i) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          index={i}
          isSelected={selectedLead?.id === lead.id}
          onSelectLead={onSelectLead}
        />
      ))}
    </div>
  )

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by owner, business, city, category..."
          className="pl-9 bg-white/5 border-white/10 text-white text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-white/30 text-sm py-10">No leads match your search.</div>
      ) : filtered.length > 6 ? (
        <ScrollArea className="h-[500px]">{grid}</ScrollArea>
      ) : (
        grid
      )}
    </div>
  )
}