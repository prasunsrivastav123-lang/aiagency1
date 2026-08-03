"use client"

// =====================================================
// CreateCampaignDialog
// components/whatsapp/CreateCampaignDialog.js
//
// Dialog for composing a new WhatsApp campaign. "Generate AI" calls
// POST /api/outreach/generate and fills the message field. Tone/
// language chips re-generate with a different instruction. Starting
// the campaign calls POST /api/whatsapp/send via lib/api.js.
//
// If a campaign is selected on the page when this opens, its
// audience/template are used as a starting point (e.g. "new
// campaign for this same audience") — the name and message are
// always left blank/empty so nothing gets duplicated by accident.
//
// Uses the `api(path, options)` helper from `@/lib/api` — it
// attaches the auth token and stringifies `options.body` itself,
// and throws an Error on non-2xx / 401 responses.
// =====================================================

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Wand2, Loader2, Send } from "lucide-react"
import { api } from "@/lib/api"
import PhonePreview from "./PhonePreview"

const TONE_CHIPS = [
  { key: "improve", label: "Improve", icon: Wand2 },
  { key: "professional", label: "Professional" },
  { key: "friendly", label: "Friendly" },
  { key: "hindi", label: "Hindi" },
  { key: "english", label: "English" },
]

const initialForm = {
  name: "",
  audience: "",
  template: "agency_intro",
  delay: "5",
  schedule: "now",
  message: "",
}

export default function CreateCampaignDialog({
  open,
  setOpen,
  selectedCampaign,
  onCampaignCreated,
}) {
  const [form, setForm] = useState(initialForm)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  // Carry the audience/template over from whatever campaign was
  // selected on the page, so starting a follow-up campaign doesn't
  // mean retyping the audience from scratch. Name and message stay
  // blank — this is always a new campaign, never an edit.
  useEffect(() => {
    if (open && selectedCampaign) {
      setForm((prev) => ({
        ...prev,
        audience: selectedCampaign.audience,
        template: selectedCampaign.template,
      }))
    }
  }, [open, selectedCampaign])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetAndClose() {
    setForm(initialForm)
    setOpen(false)
  }

  /**
   * Calls the outreach generator to draft (or refine) the WhatsApp
   * message. `instruction` carries the selected tone/language chip,
   * or is omitted for the initial "Generate AI" click.
   */
  async function handleGenerate(instruction) {
    if (!form.name && !form.audience) {
      toast.error("Add a campaign name or audience first")
      return
    }

    setGenerating(true)
    try {
      const business = {
        name: form.name || "this business",
        audience: form.audience,
        currentMessage: form.message,
        instruction: instruction || "initial_draft",
      }

      const result = await api("/outreach/generate", {
        method: "POST",
        body: { business },
      })
      const generatedMessage =
        result?.whatsapp || result?.message || result?.emailBody

      if (generatedMessage) {
        update("message", generatedMessage)
        toast.success(instruction ? "Message updated" : "Message generated")
      } else {
        toast.error("No message returned — try again")
      }
    } catch (e) {
      toast.error(e?.message || "Couldn't generate a message")
    } finally {
      setGenerating(false)
    }
  }

  async function handleStartCampaign() {
    if (!form.name) return toast.error("Campaign name is required")
    if (!form.message) return toast.error("Write or generate a message first")

    setSending(true)
    try {
      await api("/whatsapp/send", {
        method: "POST",
        body: {
          to: form.audience,
          template: form.template,
          variables: {
            message: form.message,
            delay: form.delay,
            schedule: form.schedule,
            campaignName: form.name,
          },
        },
      })

      toast.success("Campaign started 🎉")
      onCampaignCreated?.(form)
      resetAndClose()
    } catch (e) {
      toast.error(e?.message || "Failed to start campaign")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(o) : resetAndClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New WhatsApp Campaign</DialogTitle>
          <DialogDescription>
            Draft a message with AI and preview exactly how it lands in
            WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Left: form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="camp-name">Campaign Name</Label>
                <Input
                  id="camp-name"
                  placeholder="Restaurant Owners — Mumbai"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="camp-audience">Audience</Label>
                <Input
                  id="camp-audience"
                  placeholder="No-website restaurants"
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select
                  value={form.template}
                  onValueChange={(v) => update("template", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agency_intro">Agency Intro</SelectItem>
                    <SelectItem value="demo_followup">
                      Demo Follow-up
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="camp-delay">Delay (sec)</Label>
                <Input
                  id="camp-delay"
                  type="number"
                  min="0"
                  value={form.delay}
                  onChange={(e) => update("delay", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Schedule</Label>
                <Select
                  value={form.schedule}
                  onValueChange={(v) => update("schedule", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send now</SelectItem>
                    <SelectItem value="morning">
                      Tomorrow, 9:00 AM
                    </SelectItem>
                    <SelectItem value="afternoon">
                      Tomorrow, 2:00 PM
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="camp-message">Message</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  className="h-8 gap-1.5 bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
                >
                  {generating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate AI
                </Button>
              </div>
              <Textarea
                id="camp-message"
                rows={6}
                placeholder="Hi {{name}} 👋 I created a FREE website demo for {{business}}..."
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code>{"{{name}}"}</code> and{" "}
                <code>{"{{business}}"}</code> as placeholders.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TONE_CHIPS.map((chip) => {
                const Icon = chip.icon
                return (
                  <Button
                    key={chip.key}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={generating}
                    onClick={() => handleGenerate(chip.key)}
                    className="h-7 gap-1.5 rounded-full text-xs"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {chip.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Right: live preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-start justify-center rounded-xl border border-border/50 bg-muted/20 p-4"
          >
            <PhonePreview
              message={form.message}
              businessName={form.name || "Rahul Restaurant"}
            />
          </motion.div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartCampaign}
            disabled={sending}
            className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Start Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}