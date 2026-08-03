"use client";

/**
 * components/outreach/WhatsappTab.jsx
 *
 * WhatsApp message tab: friendly preview bubble, editable text,
 * Copy, Send (opens wa.me with the message prefilled — swap for the
 * Meta Cloud API later), Regenerate, word count.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Check, Send } from "lucide-react";
import { toast } from "sonner";

function toWaNumber(phone) {
  if (!phone) return null;
  return phone.replace(/[^\d]/g, "");
}

export default function WhatsappTab({ data, onChange, onRegenerate, isRegenerating, business }) {
  const [copied, setCopied] = useState(false);

  const message = data?.whatsapp || "";
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("WhatsApp message copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const handleSend = () => {
    const number = toWaNumber(business?.phone);
    if (!number) {
      toast.error("This lead has no phone number on file");
      return;
    }
    // NOTE: this opens WhatsApp Web/app via the wa.me deep link as a
    // one-click-send stand-in. Swap this for a real Meta Cloud API call
    // (POST to your /api/whatsapp/send once that integration exists) to
    // send programmatically without the user needing to hit "send" again.
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Chat-style preview */}
      <div className="rounded-2xl bg-[#e9fce3] dark:bg-emerald-950/40 p-4">
        <div className="rounded-xl rounded-tl-sm bg-white dark:bg-emerald-900/60 px-3 py-2 shadow-sm max-w-[85%] text-sm whitespace-pre-wrap">
          {message || "Your WhatsApp message preview will appear here."}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">Edit message</label>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs tabular-nums ${
                wordCount > 100 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {wordCount} words
            </span>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <Textarea
          value={message}
          onChange={(e) => onChange({ ...data, whatsapp: e.target.value })}
          rows={6}
          placeholder="WhatsApp message"
          className="resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate("whatsapp")}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
        <Button size="sm" onClick={handleSend}>
          <Send className="h-3.5 w-3.5 mr-2" />
          Send
        </Button>
      </div>
    </motion.div>
  );
}