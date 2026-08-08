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

  
    </div>
  )
}
