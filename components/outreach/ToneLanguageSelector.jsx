"use client";

/**
 * components/outreach/ToneLanguageSelector.jsx
 *
 * Small settings row shown above the tabs: tone (pill buttons) + language
 * (select dropdown). Purely controlled — parent owns the actual state and
 * decides what happens on "Apply" (re-runs generation with force: true).
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/outreach-prompts";

const TONE_LABELS = {
  friendly: "Friendly",
  professional: "Professional",
  luxury: "Luxury",
  direct: "Direct",
  sales: "Sales",
  startup: "Startup",
};

export default function ToneLanguageSelector({
  tone,
  language,
  onToneChange,
  onLanguageChange,
  onApply,
  isDirty,
  isLoading,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex-1 space-y-1.5 min-w-0">
        <span className="text-xs font-medium text-muted-foreground">Tone</span>
        <div className="flex flex-wrap gap-1.5">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToneChange(t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                tone === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:border-foreground/30"
              }`}
            >
              {TONE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 sm:w-40 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Language</span>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((l) => (
              <SelectItem key={l.value} value={l.value} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isDirty && (
        <Button size="sm" onClick={onApply} disabled={isLoading} className="shrink-0 self-end">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Apply & Regenerate
        </Button>
      )}
    </div>
  );
}