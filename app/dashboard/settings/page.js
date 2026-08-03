'use client'
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const [user, setUser] = useState(null)
  
  useEffect(() => setUser(getUser()), [])
  if (!user) return null
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Your account and API integrations.</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Name</Label>
            <Input defaultValue={user.name} />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user.email} disabled />
          </div>
          <div>
            <Label>Role</Label>
            <Input defaultValue={user.role} disabled />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Integration Guide (PDF)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Every mock in the codebase and exactly what to change to make it real.</p>
            </div>
            <a href="/downloads/AgencyOS-AI-Integration-Guide.pdf" download>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium">Download PDF</button>
            </a>
          </div>
        </CardContent>
      </Card>
      <Card>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">
          Gmail Integration
        </h3>

        <p className="text-sm text-muted-foreground">
          Connect your Gmail account to send outreach emails directly from AgencyOS AI.
        </p>
      </div>

      <Button
  onClick={() => {
    window.location.href = "/api/google/connect";
  }}
  className="bg-gradient-to-r from-red-500 to-orange-500"
>
  Connect Gmail
</Button>
    </div>
  </CardContent>
</Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Integrations (fill in yourself later)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><div className="font-medium">Google Places API</div><div className="text-xs text-muted-foreground">console.cloud.google.com/apis/credentials</div></div>
              <code className="text-xs bg-muted px-2 py-1 rounded">GOOGLE_PLACES_API_KEY</code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><div className="font-medium">GitHub PAT</div><div className="text-xs text-muted-foreground">github.com/settings/tokens?type=beta</div></div>
              <code className="text-xs bg-muted px-2 py-1 rounded">GITHUB_TOKEN</code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><div className="font-medium">Vercel Token</div><div className="text-xs text-muted-foreground">vercel.com/account/tokens</div></div>
              <code className="text-xs bg-muted px-2 py-1 rounded">VERCEL_TOKEN</code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><div className="font-medium">Google OAuth</div><div className="text-xs text-muted-foreground">console.cloud.google.com/apis/credentials</div></div>
              <code className="text-xs bg-muted px-2 py-1 rounded">GOOGLE_CLIENT_ID</code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div><div className="font-medium">WhatsApp Business API</div><div className="text-xs text-muted-foreground">developers.facebook.com/apps</div></div>
              <code className="text-xs bg-muted px-2 py-1 rounded">WHATSAPP_TOKEN</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
