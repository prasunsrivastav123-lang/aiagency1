'use client'

import { Search, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'score', label: 'Highest Score' },
  { key: 'rating', label: 'Highest Rating' },
  { key: 'recent-contact', label: 'Recently Contacted' },
  { key: 'value', label: 'Highest Value' },
]

export default function FilterBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  minScore,
  onMinScoreChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  resultCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name, phone, city, category, website, stage…"
          className="pl-9 bg-white/5 border-white/10"
        />
      </div>

      <Select value={String(minScore)} onValueChange={(v) => onMinScoreChange(Number(v))}>
        <SelectTrigger className="w-[150px] bg-white/5 border-white/10">
          <SelectValue placeholder="AI Score" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Any AI Score</SelectItem>
          <SelectItem value="80">80+ Excellent</SelectItem>
          <SelectItem value="55">55+ Good</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[170px] bg-white/5 border-white/10">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.key} value={s.key}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={onToggleFavoritesOnly}
        className={`flex items-center gap-1.5 px-3 h-9 rounded-md border text-sm shrink-0 transition-colors ${
          favoritesOnly
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
        }`}
      >
        <Star className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-rose-400' : ''}`} />
        Favorites
      </button>

      <Badge variant="outline" className="shrink-0 border-white/10 text-muted-foreground">
        {resultCount} leads
      </Badge>
    </div>
  )
}