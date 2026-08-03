"use client"

// =====================================================
// WhatsApp Automation Dashboard
// app/dashboard/whatsapp/page.js
//
// Pure orchestration — no API calls, no provider code, no mock
// data defined here. Everything comes from lib/whatsapp; this page
// just wires state between StatsCards, CampaignTable, PhonePreview
// and CreateCampaignDialog.
// =====================================================

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, MessageCircle } from "lucide-react"
import StatsCards from "@/components/whatsapp/StatsCards"
import CampaignTable from "@/components/whatsapp/CampaignTable"
import PhonePreview from "@/components/whatsapp/PhonePreview"
import CreateCampaignDialog from "@/components/whatsapp/CreateCampaignDialog"
import {
  campaigns as initialCampaigns,
  stats,
  recentMessages,
} from "@/lib/whatsapp"

export default function WhatsAppPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  console.log(initialCampaigns);
console.log(Array.isArray(initialCampaigns));
const [selectedCampaign, setSelectedCampaign] = useState(
  initialCampaigns?.[0] || null
)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Selecting a campaign clears any recipient-level message that
  // was drilled into, so the preview falls back to the campaign's
  // generic message rather than showing a stale recipient.
  function handleSelectCampaign(campaign) {
    setSelectedCampaign(campaign)
    setSelectedMessage(null)
  }

  function handleSelectMessage(message) {
    setSelectedMessage(message)
  }

  function handleCampaignCreated(form) {
    // Optimistically prepend the new campaign to the list.
    // Replace with a refetch once GET /api/whatsapp/campaigns exists.
    setCampaigns((prev) => [
      {
        id: `camp_${Date.now()}`,
        name: form.name,
        status: "running",
        audience: form.audience || "New audience",
        audienceSize: 0,
        sent: 0,
        replies: 0,
        message: form.message,
        template: form.template,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              WhatsApp Automation
            </h1>
            <p className="text-sm text-muted-foreground">
              Create AI powered WhatsApp campaigns for your leads.
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatsCards stats={stats} />
      </motion.div>

      {/* Campaigns + live preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">
            Campaigns
          </h2>
          <CampaignTable
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSelect={handleSelectCampaign}
            recentMessages={recentMessages}
            onSelectMessage={handleSelectMessage}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          whileHover={{ scale: 1.01 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">
            Preview
          </h2>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <PhonePreview
              selectedCampaign={selectedCampaign}
              selectedMessage={selectedMessage}
            />
          </div>
        </motion.div>
      </div>

      <CreateCampaignDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        selectedCampaign={selectedCampaign}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  )
}