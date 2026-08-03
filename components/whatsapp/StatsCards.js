"use client"

// =====================================================
// StatsCards
// components/whatsapp/StatsCards.js
//
// Four animated metric cards for the WhatsApp dashboard header.
// Mirrors the stat-card pattern used across the rest of AgencyOS
// (icon chip with gradient, big animated number, small label).
// =====================================================

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, Reply, TrendingUp } from "lucide-react"

const cardConfig = [
  {
    key: "campaigns",
    label: "Campaigns",
    icon: MessageCircle,
    gradient: "from-violet-500 to-blue-500",
    suffix: "",
  },
  {
    key: "messagesSent",
    label: "Messages Sent",
    icon: Send,
    gradient: "from-blue-500 to-cyan-500",
    suffix: "",
  },
  {
    key: "replies",
    label: "Replies",
    icon: Reply,
    gradient: "from-green-500 to-emerald-500",
    suffix: "",
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    icon: TrendingUp,
    gradient: "from-fuchsia-500 to-violet-500",
    suffix: "%",
  },
]

/**
 * Animated count-up for a single numeric value.
 * Keeps the animation logic local so each card can run independently.
 */
function AnimatedNumber({ value, suffix = "", duration = 0.9 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const from = 0
    const to = value

    function tick(now) {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  const rounded =
    suffix === "%" ? display.toFixed(1) : Math.round(display).toLocaleString()

  return (
    <span>
      {rounded}
      {suffix}
    </span>
  )
}

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardConfig.map((cfg, i) => {
        const Icon = cfg.icon
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-border">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{cfg.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    <AnimatedNumber
                      value={stats?.[cfg.key] ?? 0}
                      suffix={cfg.suffix}
                    />
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-lg shadow-black/10`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}