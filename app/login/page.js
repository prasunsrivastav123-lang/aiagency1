'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bot, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, setAuth } from '@/lib/api'
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } })
      setAuth(res.token, res.user)
      toast.success('Welcome back!')
      window.location.href = '/dashboard'
    } catch (e) { toast.error(e.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen mesh-bg grid-bg grid place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">AgencyOS AI</span>
        </Link>
        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
           <GoogleLogin
  onSuccess={async (credentialResponse) => {

    try {

      setLoading(true)

      const res =
        await api("/auth/google", {

          method: "POST",

          body: {

            credential:
              credentialResponse.credential

          }

        })

      setAuth(
        res.token,
        res.user
      )

      toast.success(
        "Welcome " + res.user.name
      )

      router.push("/dashboard")

    }

    catch (e) {

      toast.error(
        e.message
      )

    }

    finally {

      setLoading(false)

    }

  }}

  onError={() => {

    toast.error(
      "Google Login Failed"
    )

  }}
/>
            <div className="relative text-center text-xs text-muted-foreground">
              <span className="bg-card px-2 relative z-10">or with email</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link></p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
