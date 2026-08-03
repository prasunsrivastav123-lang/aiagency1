"use client"

// =====================================================
// PhonePreview
// components/whatsapp/PhonePreview.js
//
// Renders a live, WhatsApp-styled chat bubble preview.
//
// Two ways it's used across the app:
//  1) Page-level (app/dashboard/whatsapp/page.js): pass
//     `selectedCampaign` / `selectedMessage` and it resolves the
//     right text + delivery status on its own. Nothing selected
//     yet → shows an empty state.
//  2) Composing (CreateCampaignDialog): pass a raw `message`
//     override (+ optional contactName/businessName) so the
//     preview updates on every keystroke before anything is saved.
// =====================================================

import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  MessageCircle,
} from "lucide-react"

const STATUS_LABEL = {
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  replied: "Replied",
}

/** Replaces {{variable}} placeholders with sample values. */
function resolveTemplate(message, sample) {
  if (!message) return ""
  return message
    .replace(/{{\s*name\s*}}/gi, sample.name)
    .replace(/{{\s*business\s*}}/gi, sample.business)
}

/**
 * Works out what text, contact name, business name and delivery
 * status the preview should show, given whichever combination of
 * props was passed in.
 */
function resolvePreview({
  message,
  contactName,
  businessName,
  selectedCampaign,
  selectedMessage,
}) {
  // 1) Explicit override — used while composing a new message.
  if (message !== undefined) {
    return {
      text: resolveTemplate(message, {
        name: contactName || "Rahul",
        business: businessName || "Rahul Restaurant",
      }),
      businessName: businessName || "Rahul Restaurant",
      status: null, // still a draft, hasn't been sent
    }
  }

  // 2) A specific recipient message is selected — personalize to
  //    that recipient and show their real delivery status.
  if (selectedMessage) {
    const firstName = selectedMessage.to?.split(" ")[0] || "there"
    const base =
      selectedCampaign?.id === selectedMessage.campaignId
        ? selectedCampaign.message
        : null
    return {
      text: base
        ? resolveTemplate(base, {
            name: firstName,
            business: selectedMessage.to,
          })
        : `Hi ${firstName} 👋\n\nFollowing up on our earlier message to ${selectedMessage.to}.`,
      businessName: selectedMessage.to,
      status: selectedMessage.status,
    }
  }

  // 3) A campaign is selected, no specific recipient — show a
  //    generic sample rendering of that campaign's message.
  if (selectedCampaign) {
    return {
      text: resolveTemplate(selectedCampaign.message, {
        name: "Rahul",
        business: selectedCampaign.name,
      }),
      businessName: selectedCampaign.name,
      status: selectedCampaign.sent > 0 ? "delivered" : null,
    }
  }

  // 4) Nothing selected yet.
  return { text: "", businessName: "Rahul Restaurant", status: null }
}

function DeliveryTicks({ status }) {
  const color =
    status === "read" || status === "replied"
      ? "fill-[#53bdeb]"
      : "fill-white/50"
  return (
    <svg viewBox="0 0 16 11" className={`h-3 w-3 ${color}`} aria-hidden="true">
      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.336.146l-.451.44a.482.482 0 0 0 0 .69l3.077 2.906c.09.09.212.14.336.14a.46.46 0 0 0 .374-.19l6.815-8.394a.53.53 0 0 0-.088-.72l-.111-.312Z" />
      <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-.985-.93a.463.463 0 0 0-.336-.146.47.47 0 0 0-.336.146l-.451.44a.482.482 0 0 0 0 .69l1.657 1.566c.09.09.212.14.336.14a.46.46 0 0 0 .374-.19l6.815-8.394a.53.53 0 0 0-.088-.72l-.111-.312Z" />
    </svg>
  )
}

export default function PhonePreview({
  message,
  contactName,
  businessName,
  selectedCampaign,
  selectedMessage,
}) {
  const preview = resolvePreview({
    message,
    contactName,
    businessName,
    selectedCampaign,
    selectedMessage,
  })

  return (
    <div className="mx-auto w-full max-w-[300px]">
      {/* Phone frame */}
      <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-black shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[#0b141a] px-4 pb-1 pt-3 text-[10px] text-white/70">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-3 rounded-sm border border-white/60" />
          </div>
        </div>

        {/* WhatsApp header */}
        <div className="flex items-center gap-3 bg-[#1f2c33] px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold text-white">
            AI
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {preview.businessName}
            </p>
            <p className="text-[11px] text-white/50">online</p>
          </div>
          <Phone className="h-4 w-4 shrink-0 text-white/60" />
          <MoreVertical className="h-4 w-4 shrink-0 text-white/60" />
        </div>

        {/* Chat area */}
        <div
          className="flex min-h-[280px] flex-col justify-end gap-2 px-3 py-4"
          style={{
            backgroundColor: "#0b141a",
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 0px, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0px, transparent 40%)",
          }}
        >
          <AnimatePresence mode="wait">
            {preview.text ? (
              <motion.div
                key={preview.text}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#005c4b] px-3 py-2 text-white shadow-md"
              >
                <p className="whitespace-pre-wrap text-[13px] leading-snug">
                  {preview.text}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className="text-[10px] text-white/50">9:41 AM</span>
                  {preview.status && (
                    <>
                      <DeliveryTicks status={preview.status} />
                      <span className="sr-only">
                        {STATUS_LABEL[preview.status]}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 self-center px-6 text-center"
              >
                <MessageCircle className="h-6 w-6 text-white/20" />
                <p className="text-xs text-white/30">
                  Select a campaign to preview its message
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar (decorative) */}
        <div className="flex items-center gap-2 bg-[#1f2c33] px-3 py-2.5">
          <Smile className="h-4 w-4 text-white/50" />
          <div className="flex-1 rounded-full bg-[#2a3942] px-3 py-1.5">
            <p className="text-[11px] text-white/40">Message</p>
          </div>
          <Paperclip className="h-4 w-4 text-white/50" />
          <Mic className="h-4 w-4 text-white/50" />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {message !== undefined
          ? "Live preview — updates as you type"
          : "Live preview"}
      </p>
    </div>
  )
}