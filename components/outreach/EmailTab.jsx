"use client";

/**
 * components/outreach/EmailTab.jsx
 *
 * Cold Email tab: Subject, Preview/Edit toggle, Copy, Send, Regenerate,
 * live character count.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Check, Send, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function EmailTab({ data, onChange, onRegenerate, isRegenerating, business }) {
  const [copiedField, setCopiedField] = useState(null);
  const [mode, setMode] = useState("edit"); // "edit" | "preview"
  const [sending, setSending] = useState(false);

  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopiedField(field);
      toast.success(field === "subject" ? "Subject copied" : "Email body copied");
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const handleSend = async () => {
    const to = business?.email;
    if (!to) {
      toast.error("This lead has no email address on file");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/outreach/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: data?.emailSubject,
          body: data?.emailBody,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error);
      toast.success(`Email sent to ${to}`);
    } catch (err) {
      toast.error(err.message || "Failed to send email", {
        action: { label: "Retry", onClick: handleSend },
      });
    } finally {
      setSending(false);
    }
  };

  const bodyLength = data?.emailBody?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Subject */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">Subject</label>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => handleCopy("subject", data?.emailSubject)}
          >
            {copiedField === "subject" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <Input
          value={data?.emailSubject || ""}
          onChange={(e) => onChange({ ...data, emailSubject: e.target.value })}
          placeholder="Email subject line"
        />
      </div>

      {/* Body: Edit / Preview toggle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                mode === "edit" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                mode === "preview" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground tabular-nums">
              {bodyLength} chars
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => handleCopy("body", data?.emailBody)}
            >
              {copiedField === "body" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {mode === "edit" ? (
          <Textarea
            value={data?.emailBody || ""}
            onChange={(e) => onChange({ ...data, emailBody: e.target.value })}
            rows={10}
            placeholder="Email body"
            className="resize-none"
          />
        ) : (
          <div className="rounded-lg border p-4 bg-muted/20 text-sm whitespace-pre-wrap min-h-[220px]">
            {data?.emailBody || "Nothing to preview yet."}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate("email")}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
        <Button size="sm" onClick={handleSend} disabled={sending}>
          <Send className="h-3.5 w-3.5 mr-2" />
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </motion.div>
  );
}