'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bot,
  LayoutDashboard,
  Search,
  Kanban,
  Rocket,
  Settings,
  LogOut,
  Sparkles,
  Bell,
  MessageSquare,
  MessageCircle,
  Phone,
  BarChart3
} from 'lucide-react'
import { getUser, getToken, clearAuth } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu } from "lucide-react"


import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

const NAV = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },

  {
    href: "/dashboard/leads",
    label: "Lead Finder",
    icon: Search,
    hot: true,
  },

  {
    href: "/dashboard/crm",
    label: "CRM Pipeline",
    icon: Kanban,
  },

  {
    href: "/dashboard/outreach",
    label: "AI Outreach",
    icon: MessageSquare,
  },

  {
    href: "/dashboard/whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
  },

  {
    href: "/dashboard/campaigns",
    label: "Campaigns",
    icon: BarChart3,
  },

  {
    href: "/dashboard/calling",
    label: "Calling",
    icon: Phone,
  },

  {
    href: "/dashboard/deployments",
    label: "Deployments",
    icon: Rocket,
  },

  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
const [mobileOpen, setMobileOpen] = useState(false)
useEffect(() => {
  const token = getToken();
  const u = getUser();

  if (!token || !u) {
    clearAuth();
    router.replace("/login");
    return;
  }

  setUser(u);
}, [router]);

 function logout() {
  setMobileOpen(false);
  clearAuth();
  router.replace("/login");
}
useEffect(() => {
  setMobileOpen(false);
}, [pathname]);

  if (!user) {
  return (
    <div className="flex h-screen items-center justify-center">
      Loading...
    </div>
  );
}

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-sidebar shrink-0 flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">AgencyOS AI</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
             <Link
  key={item.href}
  href={item.href}
  onClick={() => setMobileOpen(false)}
  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
    active
      ? "bg-violet-500/10 text-violet-400"
      : "hover:bg-muted"
  }`}
>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.hot && <Badge className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-violet-500 to-blue-500 border-0">AI</Badge>}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-xs">{(user.name || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      {/* Main */}
<div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        <header className="h-16 border-b bg-background/60 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">

{/* Mobile menu */}
<div className="md:hidden">

<Sheet
  open={mobileOpen}
  onOpenChange={setMobileOpen}
>

<SheetTrigger asChild>

<Button
variant="ghost"
size="icon"
>

<Menu className="h-5 w-5"/>

</Button>

</SheetTrigger>

<SheetContent
side="left"
className="w-72 p-0 bg-background border-r"
>
  <SheetHeader className="sr-only">

  <SheetTitle>

    Navigation Menu

  </SheetTitle>

  <SheetDescription>

    Main navigation drawer for AgencyOS AI.

  </SheetDescription>

</SheetHeader>

<div className="h-16 border-b flex items-center px-6">

<div className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center">

<Bot className="h-5 w-5 text-white"/>

</div>

<span className="ml-3 font-bold text-lg">

AgencyOS AI

</span>

</div>

<nav className="p-4 space-y-2">

{NAV.map(item=>{

const Icon=item.icon

const active=

pathname===item.href ||

pathname.startsWith(item.href)

return(

<Link

key={item.href}

href={item.href}

className={`flex items-center gap-3 rounded-xl px-4 py-3 transition

${active

?"bg-violet-500/10 text-violet-400"

:"hover:bg-muted"

}`}

>

<Icon className="h-5 w-5"/>

<span>{item.label}</span>

</Link>

)

})}

</nav>

<div className="absolute bottom-0 left-0 right-0 border-t p-4">

<div className="flex items-center gap-3">

<Avatar>

<AvatarFallback>

{user.name[0]}

</AvatarFallback>

</Avatar>

<div>

<p className="font-medium">

{user.name}

</p>

<p className="text-xs text-muted-foreground">

{user.email}

</p>

</div>

<Button

variant="ghost"

size="icon"

onClick={logout}

className="ml-auto"

>

<LogOut className="h-5 w-5"/>

</Button>

</div>

</div>

</SheetContent>

</Sheet>

</div>

<div className="text-sm text-muted-foreground">

Welcome back,

</div>

<div className="font-medium">

{user.name.split(" ")[0]} 👋

</div>

</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs">Gemini 2.5 Flash</span>
            </Button>
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
      {/* Mobile Bottom Navigation */}

    </div>
  )

}