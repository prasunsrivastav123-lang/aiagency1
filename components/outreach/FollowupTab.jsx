"use client";

/**
 * components/outreach/FollowupTab.jsx
 *
 * Follow-up tab: Day 2 / Day 5 / Day 10 sequence shown as a vertical
 * timeline, each step editable and independently copyable.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { key: "day2", label: "Day 2", hint: "Casual bump" },
  { key: "day5", label: "Day 5", hint: "Add value" },
  { key: "day10", label: "Day 10", hint: "Nudge" },
  { key: "final", label: "Final", hint: "Break-up message" },
];

export default function FollowupTab({ data, onChange, onRegenerate, isRegenerating }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const followUp = data?.followUp || {};

  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopiedKey(key);
      const label = STEPS.find((s) => s.key === key)?.label || key;
      toast.success(`${label} message copied`);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const updateStep = (key, value) => {
    onChange({ ...data, followUp: { ...followUp, [key]: value } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
        <div className="space-y-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <div className="absolute -left-5 top-1.5 h-3 w-3 rounded-full bg-primary" />
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="text-xs text-muted-foreground">{step.hint}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleCopy(step.key, followUp[step.key])}
                >
                  {copiedKey === step.key ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Textarea
                value={followUp[step.key] || ""}
                onChange={(e) => updateStep(step.key, e.target.value)}
                rows={2}
                className="resize-none"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate("followUp")}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>
    </motion.div>
  );
}