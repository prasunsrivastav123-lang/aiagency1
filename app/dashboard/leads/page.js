'use client'
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search, MapPin, Phone, Globe, Instagram, Facebook, Star, Sparkles, Loader2,
  Rocket, Save, Zap, TrendingUp, Mic, Navigation, X, Clock, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { CATEGORIES } from "@/lib/categories";
import { parseSearch } from "@/lib/search/parser";
import {
Map,
Copy,
Heart,
} from "lucide-react";
//import GeminiFallbackModal from "@/components/GeminiFallbackModal";
import { renderTemplate } from "@/lib/demoTemplates/renderTemplate";
import GeminiFallbackModal from "@/components/GeminiFallbackModal";
import DemoPreview from '@/components/demo-preview'
import SearchDropdown from "@/components/search/SearchDropdown";
import { saveHistory } from "@/lib/search/history";
// ---------------------------------------------------------------------------
// Static config — all local, no network calls
// ---------------------------------------------------------------------------
const RECENTS_KEY = 'recent-searches'
const MAX_RECENTS = 6

const QUICK_SUGGESTIONS = [
  "Restaurants near me",
  "Restaurants in Delhi",
  "Restaurants in Kushinagar",
  "Restaurants in Durgapur",
  "Cafes near me",
  "Gyms near me",
  "Dentists near me",
  "Hospitals near me",
  "Clinics near me",
  "Hotels in Delhi",
  "Hotels in Mumbai",
  "Hotels in Lucknow",
  "Lawyers near me",
  "Salons near me",
  "Barbers near me",
  "Jewellery shops",
  "Mobile shops",
  "Electronics shops",
  "Furniture stores",
  "Businesses with no website",
  "Businesses with poor Google rating",
  "Businesses with no AI chatbot",
]

const TRENDING_SEARCHES = [
  'Restaurants with no website',
 "Hotels in Delhi",
  "Cafes in Mumbai",
  "Hospitals in Lucknow",
  "Gyms in Bangalore", 
]

function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map(c => (typeof c === 'string' ? { value: c, label: c } : { value: c.value ?? c.label, label: c.label ?? c.value }))
    .filter(c => c.value)
}

// ---------------------------------------------------------------------------
// ScoreRing / LeadCard — unchanged
// ---------------------------------------------------------------------------
function ScoreRing({ score }) {

  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  )

  const r = 42

  const c = 2 * Math.PI * r

  const offset = c - (safeScore / 100) * c

  const color =
    safeScore >= 80
      ? "text-emerald-500"
      : safeScore >= 60
      ? "text-violet-500"
      : safeScore >= 40
      ? "text-amber-500"
      : "text-slate-400"

  return (
    <div className="relative h-24 w-24">

      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">

        <circle
          cx="50"
          cy="50"
          r={r}
          strokeWidth="8"
          className="stroke-muted fill-none"
        />

        <circle
          cx="50"
          cy="50"
          r={r}
          strokeWidth="8"
          strokeLinecap="round"
          className={`${color} fill-none transition-all duration-1000`}
          strokeDasharray={String(c)}
          strokeDashoffset={String(offset)}
          stroke="currentColor"
        />

      </svg>

      <div className={`absolute inset-0 grid place-items-center ${color}`}>

        <div className="text-2xl font-bold">
          {safeScore}
        </div>

      </div>

    </div>
  )
}
function LeadCard({
  lead,
  enriched,
  onScore,
  onGenerateDemo,
  onSave,
  score,
  scoring,
  generating,
}) {
  const info = {
  ...lead,
  ...(enriched || {}),
};
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout>
<Card className="border border-border/60 rounded-2xl hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
        <CardContent className="p-5">
         <div className="flex justify-between gap-4">

  <div className="flex-1">

    <h2 className="text-xl font-bold">
      {lead.name}
    </h2>

    <p className="flex gap-2 mt-2 text-muted-foreground">

      <MapPin className="h-4 w-4 mt-1 shrink-0"/>

      <span>{lead.address}</span>

    </p>

    <div className="flex items-center gap-4 mt-4 text-sm">

      <div className="flex items-center gap-1">

        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>

        {lead.rating || "N/A"}

      </div>

      <div>

        ({lead.reviewCount || 0})

      </div>

 <div className="mt-4 space-y-2">

  {info.phone && (
    <div className="flex items-center gap-2 text-sm">
      <Phone className="h-4 w-4" />
      <span>{info.phone}</span>
    </div>
  )}

  {info.email && (
    <div className="text-sm">
      📧 {info.email}
    </div>
  )}

  {info.whatsapp && (
    <div className="text-sm text-green-500">
      💬 WhatsApp Available
    </div>
  )}

</div>

    </div>

  </div>

  <div className="flex flex-col items-end gap-2">

    {lead.website ? (

      <Badge className="bg-green-500/20 text-green-400 border-green-500/20">

        Website

      </Badge>

    ) : (

      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">

        No Website

      </Badge>

    )}

  {typeof score?.score === "number" && (
  <ScoreRing score={score.score} />
)}
  </div>

</div>

          <AnimatePresence>
            {score && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 border-t pt-4 space-y-3">
                <p className="text-sm">{score.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(score.breakdown || {}).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={v} className="h-1.5" />
                        <span className="text-xs font-mono">{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                  <div className="text-[10px] uppercase text-violet-400 font-semibold tracking-wider mb-1">Pitch angle</div>
                  <p className="text-sm italic">“{score.pitchAngle}”</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(score.opportunities || []).map(o => <Badge key={o} variant="secondary" className="text-xs font-normal">✨ {o}</Badge>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

         <div className="grid grid-cols-2 gap-3 mt-6">

  {!score ? (

    <Button
      onClick={() => onScore(lead)}
      disabled={scoring}
    >

      {scoring ? (

        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>

      ) : (

        <Sparkles className="mr-2 h-4 w-4"/>

      )}

      Score AI

    </Button>

  ) : (

    <Button
      onClick={() => onGenerateDemo(lead)}
      disabled={generating}
    >

      {generating ? (

        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>

      ) : (

        <Rocket className="mr-2 h-4 w-4"/>

      )}

      Generate Demo

    </Button>

  )}
  {info.services?.length > 0 && (

<div className="mt-4">

<h3 className="font-semibold">

Services

</h3>

<div className="flex flex-wrap gap-2 mt-2">

{info.services.map(service=>(

<Badge key={service}>

{service}

</Badge>

))}

</div>

</div>

)}
{info.socials?.instagram && (

<a
href={info.socials.instagram}
target="_blank"
>

Instagram

</a>

)}

  <Button
    variant="outline"
    onClick={() => onSave(lead, score)}
  >

    <Heart className="mr-2 h-4 w-4"/>

    Save CRM

  </Button>

  <Button
    variant="outline"
    onClick={() => {

      const url =
        lead.mapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          lead.name + " " + lead.address
        )}`

      window.open(url,"_blank")

    }}
  >

    <Map className="mr-2 h-4 w-4"/>

    Open Maps

  </Button>

  <Button
    variant="outline"
    onClick={() => {

      navigator.clipboard.writeText(
        info.phone || ""
      )

      toast.success("Phone copied!")

    }}
  >

    <Copy className="mr-2 h-4 w-4"/>

    Copy Phone

  </Button>

</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton card shown while a search is in flight
// ---------------------------------------------------------------------------
function LeadCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-muted animate-pulse mt-3" />
          </div>
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse shrink-0" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-28 rounded-md bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function LeadFinder() {
  const [query, setQuery] = useState("")
  const [leads, setLeads] = useState([])
  const [scores, setScores] = useState({})
const [scoring, setScoring] = useState({})
  const [loading, setLoading] = useState(false)
 const [enrichedLeads, setEnrichedLeads] = useState({})
  const [generating, setGenerating] = useState({})
  const [demo, setDemo] = useState(null)
  const [demoOpen, setDemoOpen] = useState(false)

  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState([])
  const [locating, setLocating] = useState(false)
const [fallbackOpen,setFallbackOpen]=useState(false);

const [fallbackLead,setFallbackLead]=useState(null);
  const wrapperRef = useRef(null)
  const categories = normalizeCategories(CATEGORIES)

  // Load recent searches once on mount
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]")
      setRecentSearches(recent)
    } catch {
      setRecentSearches([])
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function saveRecentSearch(term) {
    if (!term.trim()) return
    setRecentSearches(prev => {
      const next = [term, ...prev.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENTS)
      try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function clearRecentSearches() {
    setRecentSearches([])
    try { localStorage.removeItem(RECENTS_KEY) } catch {}
  }

  // 100% local autocomplete — no API call, no debounce needed
  const isTyping = query.trim().length >= 2
  const localMatches = isTyping
    ? QUICK_SUGGESTIONS.filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  const dropdownItems = isTyping
    ? localMatches.map(s => ({ type: 'suggestion', label: s }))
    : [
        ...recentSearches.map(s => ({ type: 'recent', label: s })),
        ...TRENDING_SEARCHES.map(s => ({ type: 'trending', label: s })),
      ]

  function handleQueryChange(e) {
    setQuery(e.target.value)
    setSelectedIndex(-1)
    setShowDropdown(true)
  }

  function runSearch(term) {
    const value = (term ?? query).trim()
    if (!value) return toast.error("Enter a search")
    setQuery(value)
    setShowDropdown(false)
    setSelectedIndex(-1)
    search(value)
  }

  function handleKeyDown(e) {
    if (!showDropdown || dropdownItems.length === 0) {
      if (e.key === 'Enter') runSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % dropdownItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i <= 0 ? dropdownItems.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && dropdownItems[selectedIndex]) {
        runSearch(dropdownItems[selectedIndex].label)
      } else {
        runSearch()
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      return toast.error("Geolocation isn't supported by this browser")
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const city = data?.address?.city || data?.address?.town || data?.address?.county || data?.address?.state
          if (city) {
            setQuery(q => (q.trim() ? q : `Businesses near ${city}`))
            toast.success(`Location set to ${city}`)
          } else {
            toast.error("Couldn't resolve your city, try entering it manually")
          }
        } catch {
          toast.error("Couldn't look up your location")
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        toast.error("Location access denied")
      }
    )
  }

  async function search(termOverride) {
    const term = (termOverride ?? query).trim()
    if (!term) {
      return toast.error("Enter a search")
    }

    setLoading(true)
    setScores({})
    saveRecentSearch(term)

    try {
    let parsed = parseSearch(term);

if (!parsed.city && !parsed.category) {

parsed = {

city: term,

category: "restaurant"

};

}
else if (!parsed.city) {

parsed.city = term;

}

if (!parsed.category) {
  toast.error("Please enter a business category.");
  return;
}

const res = await api("/leads/search", {
  method: "POST",
  body: {
    city: parsed.city,
    category: parsed.category,
  },
});

      setLeads(res.leads)
      toast.success(`Found ${res.count} businesses`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }
async function scoreLead(lead) {

  setScoring(s => ({
    ...s,
    [lead.id]: true
  }))

  try {

    let enriched =
      enrichedLeads[lead.id]

    // Only enrich if not already cached
    if (!enriched) {

     enriched = await api(
  "/leads/enrich",
  {
    method: "POST",
    body: lead,
  }
)

      setEnrichedLeads(prev => ({
        ...prev,
        [lead.id]: enriched,
      }))

    }

    const business = {
      ...lead,
      ...enriched,
    }

    const score =
      await api(
        "/leads/score",
        {
          method: "POST",
          body: {
            business,
          },
        }
      )

    setScores(prev => ({
      ...prev,
      [lead.id]: score,
    }))

  }

  catch (e) {

    toast.error(e.message)

  }

  finally {

    setScoring(s => ({
      ...s,
      [lead.id]: false
    }))

  }

}

  async function scoreAll() {
    for (const l of leads) {
      if (!scores[l.id]) await scoreLead(l)
    }
  }async function generateDemo(lead) {

  setGenerating(g => ({
    ...g,
    [lead.id]: true
  }))

  toast.loading(
    "Gemini is designing the demo...",
    {
      id: "gen",
    }
  )

  try {

    let enriched =
      enrichedLeads[lead.id]

    if (!enriched) {

     enriched = await api(
  "/leads/enrich",
  {
    method: "POST",
    body: lead,
  }
)

      setEnrichedLeads(prev => ({
        ...prev,
        [lead.id]: enriched,
      }))

    }

    const business = {
      ...lead,
      ...enriched,
    }

    const res =
      await api(
        "/demo/generate",
        {
          method: "POST",
          body: {
            business,
          },
        }
      )
   if (res.fallbackRequired) {

    toast.dismiss("gen");

    setFallbackLead(business);

    setFallbackOpen(true);

    return;

}


    setDemo(res)

    setDemoOpen(true)

    toast.success(
      "Demo Ready!",
      {
        id: "gen",
      }
    )

  }

  catch (e) {

    toast.error(
      e.message,
      {
        id: "gen",
      }
    )

  }

  finally {

    setGenerating(g => ({
      ...g,
      [lead.id]: false
    }))

  }

}

async function handleFallbackCategory(category) {

    const demo = renderTemplate(category, fallbackLead);

   const saved = await api("/demo/save-local", {
    method: "POST",
    body: {
        business: fallbackLead,
        demo,
    },
});

    setFallbackOpen(false);

    setDemo(saved);

    setDemoOpen(true);

}
async function saveLead(lead, score) {

  try {

    let enriched =
      enrichedLeads[lead.id]

    if (!enriched) {

      enriched = await api(
  "/leads/enrich",
  {
    method: "POST",
    body: lead,
  }
)

      setEnrichedLeads(prev => ({
        ...prev,
        [lead.id]: enriched,
      }))

    }

    await api(
      "/leads",
      {
        method: "POST",
        body: {
          business: {
            ...lead,
            ...enriched,
          },
          score,
        },
      }
    )

    toast.success(
      "Saved to CRM"
    )

  }

  catch (e) {

    toast.error(
      e.message
    )

  }

}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Finder</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover local businesses and let AI score their opportunity.</p>
      </div>

      <Card className="border-border/60 overflow-visible">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search bar + dropdown */}
            <div className="flex-1 relative" ref={wrapperRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
   <Input
  value={query}
  placeholder="Restaurants in Delhi..."
  className="pl-10"
  onFocus={() => setShowDropdown(true)}
  onChange={(e) => {
    setQuery(e.target.value)
    setShowDropdown(true)
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      runSearch()
    }
  }}
/>

<SearchDropdown
  query={query}
  visible={showDropdown}
 onSelect={(text) => {

setQuery(text)

saveHistory(text)

setShowDropdown(false)

runSearch(text)

}}
/>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setQuery('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Voice search"
                  className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => toast.info('Voice search is coming soon')}
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Use current location"
                  disabled={locating}
                  className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
                  onClick={useCurrentLocation}
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                </button>
              </div>

         
            </div>

            <Button onClick={() => runSearch()} disabled={loading} className="bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
            {leads.length > 0 && (
              <Button variant="outline" onClick={scoreAll}><Zap className="h-4 w-4 mr-2" />Score all with AI</Button>
            )}
          </div>

          {/* Quick category chips — one tap to search */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {categories.slice(0, 10).map(c => (
                <button
                  key={`chip-${c.value}`}
                  onClick={() => runSearch(c.label)}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading skeletons */}
      {loading && leads.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <LeadCardSkeleton key={i} />)}
        </div>
      )}

      <AnimatePresence>
        {leads.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
           {leads.map((l) => (
  <LeadCard
    key={l.id}
    lead={l}
    enriched={enrichedLeads[l.id]}
    score={scores[l.id]}
    scoring={scoring[l.id]}
    generating={generating[l.id]}
    onScore={scoreLead}
    onGenerateDemo={generateDemo}
    onSave={saveLead}
  />
))}
          </motion.div>
        )}
      </AnimatePresence>

      {leads.length === 0 && !loading && (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 grid place-items-center mb-4">
              <Search className="h-6 w-6 text-violet-500" />
            </div>
            <h3 className="font-semibold text-lg">Start by searching</h3>
            <p className="text-muted-foreground text-sm mt-1">Type a city + category and hit Search to discover businesses.</p>
          </CardContent>
        </Card>
      )}

      {/* Demo preview dialog */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-6xl h-[92vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b bg-background/80 backdrop-blur">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI-generated demo for {demo?.business?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-auto">
            {demo && <DemoPreview business={demo.business} demo={demo.demo} demoId={demo.id} />}
          </div>
        </DialogContent>
      </Dialog>
      <GeminiFallbackModal
    open={fallbackOpen}
    onClose={() => setFallbackOpen(false)}
    onSelectCategory={handleFallbackCategory}
/>
    </div>
  )
}