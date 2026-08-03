"use client";

/**
 * components/outreach/PreviewTab.jsx
 *
 * "Preview Website" tab. Opens the generated demo (if your existing Demo
 * Generator produced one — e.g. `business.demoUrl`) or falls back to the
 * lead's real website (`business.website`). Read-only, no copy/regenerate
 * controls since there's no AI text here.
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe } from "lucide-react";

export default function PreviewTab({ business }) {
  const demoUrl = business?.demoUrl;
  const website = business?.website;
  const url = demoUrl || website;

  if (!url) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground"
      >
        <Globe className="h-8 w-8 opacity-40" />
        <p className="text-sm">No demo or website URL available for this lead yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground truncate">
          {demoUrl ? "Generated demo" : "Live website"} — {url}
        </span>
        <Button size="sm" variant="outline" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open
          </a>
        </Button>
      </div>
      <div className="rounded-lg border overflow-hidden bg-background" style={{ height: 420 }}>
        <iframe
          src={url}
          title="Website preview"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </motion.div>
  );
}