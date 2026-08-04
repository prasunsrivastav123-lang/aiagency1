'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Globe, MessageCircle, Navigation } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function StarRating({ rating = 0 }) {
  const full = Math.round(rating)
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(full)}
      <span className="text-white/20">{'★'.repeat(5 - full)}</span>
    </span>
  )
}

export default function BusinessCard({ lead }) {
  if (!lead) return null

  const { business, owner, rating, category, city, phone, website, address, hasWebsite } = lead

  function handleCall() {
    if (phone) window.open(`tel:${phone}`, '_self')
  }

  function handleWhatsApp() {
    if (!phone) return
    const digits = phone.replace(/\D/g, '')
    const text = encodeURIComponent(`Hi ${owner || ''}, I have a quick idea for ${business}...`)
    window.open(`https://wa.me/${digits}?text=${text}`, '_blank')
  }

  function handleMaps() {
    const query = encodeURIComponent(address || `${business} ${city || ''}`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }

  function handleWebsite() {
    if (website) window.open(website.startsWith('http') ? website : `https://${website}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-white font-medium">{business}</h3>
        <Badge
          className={`shrink-0 border rounded-full px-2 py-0.5 text-[10px] ${
            hasWebsite
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
          }`}
        >
          {hasWebsite ? 'Website' : 'Needs Website'}
        </Badge>
      </div>

      {owner && <p className="text-white/40 text-xs mb-2">{owner}</p>}

      <div className="flex items-center gap-3 text-xs text-white/50 mb-1 flex-wrap">
        <StarRating rating={rating} />
        {category && (
          <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[10px]">
            {category}
          </span>
        )}
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {city}
        </span>
      </div>

      <div className="text-xs text-white/40 space-y-1 mb-3">
        {phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> {phone}
          </div>
        )}
        {website && (
          <div className="flex items-center gap-1 truncate">
            <Globe className="w-3 h-3" /> {website.replace(/^https?:\/\//, '')}
          </div>
        )}
        {address && (
          <div className="flex items-center gap-1 truncate">
            <Navigation className="w-3 h-3" /> {address}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={handleCall}
          disabled={!phone}
          className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white rounded-lg h-8 text-xs disabled:opacity-40"
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
        </Button>
        <Button
          size="sm"
          onClick={handleWhatsApp}
          disabled={!phone}
          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-lg h-8 text-xs disabled:opacity-40"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
        </Button>
        <Button
          size="sm"
          onClick={handleMaps}
          className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg h-8 text-xs"
        >
          <MapPin className="w-3.5 h-3.5 mr-1.5" /> Maps
        </Button>
        <Button
          size="sm"
          onClick={handleWebsite}
          disabled={!website}
          className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg h-8 text-xs disabled:opacity-40"
        >
          <Globe className="w-3.5 h-3.5 mr-1.5" /> Website
        </Button>
      </div>
    </motion.div>
  )
}