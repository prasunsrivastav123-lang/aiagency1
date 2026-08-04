"use client"

// =====================================================
// CampaignTable
// components/whatsapp/CampaignTable.js
//
// Controlled component — selection lives on the parent page.
// Desktop: full data table. Mobile (< md): stacked CampaignCard
// list. Clicking a row/card calls `onSelect(campaign)`, which the
// page uses to open the detail Sheet AND update PhonePreview.
// Selecting a recipient inside the sheet calls `onSelectMessage`
// so PhonePreview can show that recipient's real delivery status.
// =====================================================

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Users, Clock, BarChart3 } from "lucide-react"
import { statusStyles } from "@/lib/whatsapp/index";
console.log("statusStyles:", statusStyles);
import CampaignCard from "./CampaignCard"

function conversion(campaign) {
  if (!campaign.sent) return 0
  return Math.round((campaign.replies / campaign.sent) * 1000) / 10
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function CampaignTable({
  campaigns = [],
  selectedCampaign = null,
  onSelect = () => {},
  recentMessages = [],
  onSelectMessage = () => {},
}) {
  const messagesForSelected = selectedCampaign
    ? recentMessages.filter((m) => m.campaignId === selectedCampaign.id)
    : []

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Replies</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c, i) => {
              const status = statusStyles[c.status] ?? statusStyles.draft
              const isSelected = selectedCampaign?.id === c.id
              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onClick={() => onSelect(c)}
                  className={`cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40 ${
                    isSelected ? "bg-muted/40" : ""
                  }`}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`gap-1.5 border ${status.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.audience}
                  </TableCell>
                  <TableCell className="text-right">{c.sent}</TableCell>
                  <TableCell className="text-right">{c.replies}</TableCell>
                  <TableCell className="text-right">
                    <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text font-medium text-transparent">
                      {conversion(c)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} onClick={() => onSelect(c)} />
        ))}
      </div>

      {/* Detail sheet */}
      <Sheet
        open={!!selectedCampaign}
        onOpenChange={(open) => !open && onSelect(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedCampaign && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCampaign.name}</SheetTitle>
                <SheetDescription>{selectedCampaign.audience}</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="message" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="message">Message</TabsTrigger>
                  <TabsTrigger value="recipients">Recipients</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Message */}
                <TabsContent value="message" className="mt-4">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedCampaign.message}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Template: {selectedCampaign.template}
                  </p>
                </TabsContent>

                {/* Recipients */}
                <TabsContent value="recipients" className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {selectedCampaign.audienceSize} recipients targeted
                  </div>
                  {messagesForSelected.length > 0 ? (
                    <div className="divide-y divide-border/50 rounded-lg border border-border/50">
                      {messagesForSelected.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onSelectMessage?.(m)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/40"
                        >
                          <div>
                            <p className="font-medium">{m.to}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.phone}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {m.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No message activity yet for this campaign.
                    </p>
                  )}
                </TabsContent>

                {/* Analytics */}
                <TabsContent value="analytics" className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                      <p className="text-lg font-semibold">
                        {selectedCampaign.sent}
                      </p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                      <p className="text-lg font-semibold">
                        {selectedCampaign.replies}
                      </p>
                      <p className="text-xs text-muted-foreground">Replies</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                      <p className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-lg font-semibold text-transparent">
                        {conversion(selectedCampaign)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Conv.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Detailed trend charts coming once real send data is
                    available.
                  </div>
                </TabsContent>

                {/* Timeline */}
                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-3 border-l border-border/50 pl-4">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
                      <p className="text-sm font-medium">Campaign created</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(selectedCampaign.createdAt)}
                      </p>
                    </div>
                    {selectedCampaign.sent > 0 && (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <p className="text-sm font-medium">
                          {selectedCampaign.sent} messages sent
                        </p>
                      </div>
                    )}
                    {selectedCampaign.replies > 0 && (
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                        <p className="text-sm font-medium">
                          {selectedCampaign.replies} replies received
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}