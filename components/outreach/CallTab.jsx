"use client";

/**
 * components/outreach/CallTab.jsx
 *
 * Call Script tab: structured sections (opening, pain points, discovery
 * questions, objection handling, closing) rendered as an editable outline.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

function scriptToPlainText(script) {
  if (!script) return "";
  const pain = (script.painPoints || []).map((p) => `- ${p}`).join("\n");
  const questions = (script.questions || []).map((q) => `- ${q}`).join("\n");
  const objections = (script.objectionHandling || [])
    .map((o) => `Q: ${o.objection}\nA: ${o.response}`)
    .join("\n\n");

  return `OPENING\n${script.opening || ""}\n\nPAIN POINTS\n${pain}\n\nPITCH\n${script.pitch || ""}\n\nQUESTIONS\n${questions}\n\nOBJECTION HANDLING\n${objections}\n\nCLOSING\n${script.closing || ""}`;
}

export default function CallTab({ data, onChange, onRegenerate, isRegenerating }) {
  const [copied, setCopied] = useState(false);
  const script = data?.callScript || {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptToPlainText(script));
      setCopied(true);
      toast.success("Call script copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const updateField = (field, value) => {
    onChange({ ...data, callScript: { ...script, [field]: value } });
  };

  const updateListField = (field, index, value) => {
    const list = [...(script[field] || [])];
    list[index] = value;
    updateField(field, list);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Full script</h4>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Opening</label>
        <Textarea
          value={script.opening || ""}
          onChange={(e) => updateField("opening", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Pain points</label>
        {(script.painPoints || []).map((p, i) => (
          <Textarea
            key={i}
            value={p}
            onChange={(e) => updateListField("painPoints", i, e.target.value)}
            rows={1}
            className="resize-none"
          />
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Pitch</label>
        <Textarea
          value={script.pitch || ""}
          onChange={(e) => updateField("pitch", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Discovery questions
        </label>
        {(script.questions || []).map((q, i) => (
          <Textarea
            key={i}
            value={q}
            onChange={(e) => updateListField("questions", i, e.target.value)}
            rows={1}
            className="resize-none"
          />
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Objection handling
        </label>
        {(script.objectionHandling || []).map((o, i) => (
          <div key={i} className="rounded-lg border p-2.5 space-y-1.5">
            <Textarea
              value={o.objection || ""}
              onChange={(e) => {
                const list = [...(script.objectionHandling || [])];
                list[i] = { ...list[i], objection: e.target.value };
                updateField("objectionHandling", list);
              }}
              rows={1}
              placeholder="Objection"
              className="resize-none text-sm"
            />
            <Textarea
              value={o.response || ""}
              onChange={(e) => {
                const list = [...(script.objectionHandling || [])];
                list[i] = { ...list[i], response: e.target.value };
                updateField("objectionHandling", list);
              }}
              rows={2}
              placeholder="Response"
              className="resize-none text-sm"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Closing</label>
        <Textarea
          value={script.closing || ""}
          onChange={(e) => updateField("closing", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate("call")}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>
    </motion.div>
  );
}