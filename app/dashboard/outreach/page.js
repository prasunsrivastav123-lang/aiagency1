'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Sparkles } from 'lucide-react'

export default function Outreach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Outreach</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalized cold messages that reference the demo you built.</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 grid place-items-center mb-4">
            <MessageSquare className="h-6 w-6 text-violet-500" />
          </div>
          <h3 className="font-semibold text-lg">Coming next</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">The AI Outreach engine (Gemini-drafted emails + WhatsApp templates) is the next feature. Ask me to build it when you're ready.</p>
        </CardContent>
      </Card>
    </div>
  )
}
