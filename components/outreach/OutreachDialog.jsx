"use client";

/**
 * components/outreach/OutreachDialog.jsx
 *
 * The "Generate Outreach" dialog. Cache-first: on open it asks
 * POST /api/outreach/generate for this lead, which itself checks Mongo
 * before ever calling Gemini (see the route for that logic) — so
 * re-opening the dialog for the same lead is instant and free.
 *
 * Import this lazily from the Lead Card:
 *   const OutreachDialog = dynamic(() => import("@/components/outreach/OutreachDialog"), { ssr: false });
 *
 * Usage:
 *   <OutreachDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     business={lead}      // same lead object passed to Generate Demo
 *     userName={user?.name}
 *   />
 */

import { useState, useEffect, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, MessageCircle, Phone, Clock, FileText, Globe, RotateCcw, Zap } from "lucide-react";

import EmailTab from "@/components/outreach/EmailTab";
import WhatsappTab from "@/components/outreach/WhatsappTab";
import CallTab from "@/components/outreach/CallTab";
import FollowupTab from "@/components/outreach/FollowupTab";
import ProposalTab from "@/components/outreach/ProposalTab";
import PreviewTab from "@/components/outreach/PreviewTab";
import ToneLanguageSelector from "@/components/outreach/ToneLanguageSelector";

const TABS = [
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "call", label: "Call", icon: Phone },
  { value: "proposal", label: "Proposal", icon: FileText },
  { value: "followup", label: "Follow-up", icon: Clock },
  { value: "preview", label: "Preview Website", icon: Globe },
];

function OutreachDialogSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg ml-auto" />
    </div>
  );
}

function OutreachDialog({ open, onOpenChange, business, userName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regeneratingTab, setRegeneratingTab] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  const [wasCached, setWasCached] = useState(false);

  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("english");
  const [appliedTone, setAppliedTone] = useState("professional");
  const [appliedLanguage, setAppliedLanguage] = useState("english");

  const fetchOutreach = useCallback(
    async ({ section, force } = {}) => {
      if (section) setRegeneratingTab(section);
      else {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetch("/api/outreach/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business,
            tone,
            language,
            userName,
            section,
            force,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to generate outreach content");
        }

        const json = await res.json();
        setData(json);
        setWasCached(Boolean(json.cached));
        setAppliedTone(tone);
        setAppliedLanguage(language);
      } catch (err) {
        if (section) {
          toast.error(err.message || "Regeneration failed", {
            action: { label: "Retry", onClick: () => fetchOutreach({ section }) },
          });
        } else {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
        setRegeneratingTab(null);
      }
    },
    [business, tone, language, userName]
  );

  // Fetch once when the dialog opens for a given lead (cache-first — see route).
  useEffect(() => {
    if (open && business) {
      fetchOutreach();
    }
    if (!open) {
      setData(null);
      setError(null);
      setActiveTab("email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, business?.id]);

  const handleRegenerateSection = (section) => fetchOutreach({ section });
  const handleApplyToneLanguage = () => fetchOutreach({ force: true });

  const isDirty = tone !== appliedTone || language !== appliedLanguage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Generate Outreach
            {business?.name && (
              <span className="text-muted-foreground font-normal">— {business.name}</span>
            )}
            {!loading && data && (
              <Badge variant={wasCached ? "secondary" : "default"} className="text-[10px] gap-1">
                <Zap className="h-3 w-3" />
                {wasCached ? "Loaded instantly" : "Freshly generated"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            AI-generated, editable outreach copy across every channel. Generated once per lead
            and cached — reopening this dialog won't call Gemini again.
          </DialogDescription>
        </DialogHeader>

        {!loading && !error && (
          <ToneLanguageSelector
            tone={tone}
            language={language}
            onToneChange={setTone}
            onLanguageChange={setLanguage}
            onApply={handleApplyToneLanguage}
            isDirty={isDirty}
            isLoading={loading}
          />
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OutreachDialogSkeleton />
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 py-10 text-center"
            >
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchOutreach()}>
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Retry
              </Button>
            </motion.div>
          )}

          {!loading && !error && data && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full h-auto">
                  {TABS.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger key={value} value={value} className="text-[11px] sm:text-xs py-1.5">
                      <Icon className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="email">
                    <EmailTab
                      data={data}
                      onChange={setData}
                      onRegenerate={handleRegenerateSection}
                      isRegenerating={regeneratingTab === "email"}
                      business={business}
                    />
                  </TabsContent>
                  <TabsContent value="whatsapp">
                    <WhatsappTab
                      data={data}
                      onChange={setData}
                      onRegenerate={handleRegenerateSection}
                      isRegenerating={regeneratingTab === "whatsapp"}
                      business={business}
                    />
                  </TabsContent>
                  <TabsContent value="call">
                    <CallTab
                      data={data}
                      onChange={setData}
                      onRegenerate={handleRegenerateSection}
                      isRegenerating={regeneratingTab === "call"}
                    />
                  </TabsContent>
                  <TabsContent value="proposal">
                    <ProposalTab
                      data={data}
                      onChange={setData}
                      onRegenerate={handleRegenerateSection}
                      isRegenerating={regeneratingTab === "proposal"}
                    />
                  </TabsContent>
                  <TabsContent value="followup">
                    <FollowupTab
                      data={data}
                      onChange={setData}
                      onRegenerate={handleRegenerateSection}
                      isRegenerating={regeneratingTab === "followUp"}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <PreviewTab business={business} />
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Memoized so re-renders of the Lead Card grid never re-render this dialog
// unless its own props actually change.
export default memo(OutreachDialog);