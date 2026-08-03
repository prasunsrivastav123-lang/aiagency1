"use client";

/**
 * components/outreach/ProposalTab.jsx
 *
 * Proposal tab: a professional package-style preview — agency name,
 * service line-items, timeline, price, estimated ROI — plus the
 * intro/problem/solution/benefits copy underneath. Fully editable.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Check, X, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

function proposalToPlainText(p, agencyName) {
  const services = (p.services || []).map((s) => `- ${s}`).join("\n");
  const benefits = (p.benefits || []).map((b) => `- ${b}`).join("\n");
  return `${agencyName}\n\n${services}\n\nTimeline: ${p.timeline || ""}\nPrice: ${p.price || ""}\nEstimated ROI: ${p.estimatedROI || ""}\n\n${p.intro || ""}\n\nProblem:\n${p.problem || ""}\n\nSolution:\n${p.solution || ""}\n\nBenefits:\n${benefits}`;
}

export default function ProposalTab({
  data,
  onChange,
  onRegenerate,
  isRegenerating,
  agencyName = "AgencyOS AI",
}) {
  const [copied, setCopied] = useState(false);
  const proposal = data?.proposalIntro || {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(proposalToPlainText(proposal, agencyName));
      setCopied(true);
      toast.success("Proposal copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const updateField = (field, value) => {
    onChange({ ...data, proposalIntro: { ...proposal, [field]: value } });
  };

  const updateListItem = (field, index, value) => {
    const list = [...(proposal[field] || [])];
    list[index] = value;
    updateField(field, list);
  };

  const removeListItem = (field, index) => {
    updateField(
      field,
      (proposal[field] || []).filter((_, i) => i !== index)
    );
  };

  const addListItem = (field) => {
    updateField(field, [...(proposal[field] || []), ""]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Package-style preview card */}
      <div className="rounded-xl border bg-gradient-to-b from-muted/40 to-transparent p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            {agencyName}
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Services */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Services included</label>
          <div className="space-y-1.5">
            {(proposal.services || []).map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  value={s}
                  onChange={(e) => updateListItem("services", i, e.target.value)}
                  className="bg-background"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeListItem("services", i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addListItem("services")}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add service
            </Button>
          </div>
        </div>

        {/* Timeline / Price / ROI */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Timeline</label>
            <Input
              value={proposal.timeline || ""}
              onChange={(e) => updateField("timeline", e.target.value)}
              className="bg-background h-8 text-sm"
              placeholder="5 Days"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Price</label>
            <Input
              value={proposal.price || ""}
              onChange={(e) => updateField("price", e.target.value)}
              className="bg-background h-8 text-sm"
              placeholder="₹39,999"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Est. ROI</label>
            <Input
              value={proposal.estimatedROI || ""}
              onChange={(e) => updateField("estimatedROI", e.target.value)}
              className="bg-background h-8 text-sm"
              placeholder="400%"
            />
          </div>
        </div>
      </div>

      {/* Narrative copy */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Intro</label>
          <Textarea
            value={proposal.intro || ""}
            onChange={(e) => updateField("intro", e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Problem</label>
          <Textarea
            value={proposal.problem || ""}
            onChange={(e) => updateField("problem", e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Solution</label>
          <Textarea
            value={proposal.solution || ""}
            onChange={(e) => updateField("solution", e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Benefits</label>
          <div className="space-y-1.5">
            {(proposal.benefits || []).map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  value={b}
                  onChange={(e) => updateListItem("benefits", i, e.target.value)}
                  className="bg-background"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeListItem("benefits", i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addListItem("benefits")}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add benefit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegenerate("proposal")}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>
    </motion.div>
  );
}