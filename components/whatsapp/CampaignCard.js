"use client"

// =====================================================
// CampaignCard
// components/whatsapp/CampaignCard.js
//
// Compact card representation of a single campaign. Used for the
// mobile/stacked layout of CampaignTable, and reused as the summary
// header inside the campaign detail Sheet.
// =====================================================

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Send, Reply, Clock } from "lucide-react"
import { statusStyles } from "@/lib/whatsapp/index";

function conversion(campaign) {
  if (!campaign.sent) return 0
  return Math.round((campaign.replies / campaign.sent) * 1000) / 10
}

export default function CampaignCard({ campaign, onClick, className = "" }) {
  const status = statusStyles[campaign.status] ?? statusStyles.draft

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={onClick}
        className={`cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-violet-500/40 ${className}`}
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium leading-tight">{campaign.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {campaign.audience}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 gap-1.5 border ${status.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                {campaign.audienceSize}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Send className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{campaign.sent}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Reply className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{campaign.replies}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-xs font-semibold text-transparent">
                {conversion(campaign)}%
              </span>
              <span className="text-[10px] text-muted-foreground">conv.</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(campaign.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}