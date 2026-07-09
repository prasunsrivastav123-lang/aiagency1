"use client";

import { useMemo } from "react";
import { MapPin, Building2, History, TrendingUp } from "lucide-react";

import { CITIES } from "@/lib/search/cities";
import { CATEGORIES } from "@/lib/search/categories";
import { TRENDING } from "@/lib/search/trending";
import { getHistory } from "@/lib/search/history";

export default function SearchDropdown({
  query,
  visible,
  onSelect,
}) {

  const history =
    typeof window !== "undefined"
      ? getHistory()
      : [];

  const cities = useMemo(() => {

    if (!query)
      return [];

    return CITIES
      .filter((c) =>
        c.toLowerCase()
          .includes(query.toLowerCase())
      )
      .slice(0, 6);

  }, [query]);

  const categories = useMemo(() => {

    if (!query)
      return [];

    return CATEGORIES
      .filter((c) =>
        c.toLowerCase()
          .includes(query.toLowerCase())
      )
      .slice(0, 6);

  }, [query]);

  if (!visible)
    return null;

  return (

    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border bg-background shadow-2xl overflow-hidden z-50">

      {/* Cities */}

      {cities.length > 0 && (

        <div className="p-2">

          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">

            Cities

          </div>

          {cities.map(city => (

            <button
              key={city}
              onClick={() => onSelect(city)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition"
            >

              <MapPin className="h-4 w-4 text-violet-500"/>

              <span>{city}</span>

            </button>

          ))}

        </div>

      )}

      {/* Categories */}

      {categories.length > 0 && (

        <div className="border-t p-2">

          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">

            Categories

          </div>

          {categories.map(cat => (

            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition"
            >

              <Building2 className="h-4 w-4 text-blue-500"/>

              <span>{cat}</span>

            </button>

          ))}

        </div>

      )}

      {/* Recent */}

      {!query && history.length > 0 && (

        <div className="border-t p-2">

          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">

            Recent Searches

          </div>

          {history.map(item => (

            <button
              key={item}
              onClick={() => onSelect(item)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition"
            >

              <History className="h-4 w-4"/>

              <span>{item}</span>

            </button>

          ))}

        </div>

      )}

      {/* Trending */}

      {!query && (

        <div className="border-t p-2">

          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">

            Trending

          </div>

          {TRENDING.map(item => (

            <button
              key={item}
              onClick={() => onSelect(item)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition"
            >

              <TrendingUp className="h-4 w-4 text-green-500"/>

              <span>{item}</span>

            </button>

          ))}

        </div>

      )}

    </div>

  );

}