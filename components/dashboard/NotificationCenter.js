'use client'

import { useEffect, useState } from 'react'
import { Bell, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clearNotifications, getNotifications, markNotificationsRead } from '@/lib/notifications'

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  useEffect(() => setItems(getNotifications()), [])
  const unread = items.filter((item) => !item.read).length
  function toggle() { const next = !open; setOpen(next); if (next) { markNotificationsRead(); setItems(getNotifications()) } }
  return <div className="relative"><Button variant="ghost" size="icon" aria-label="Notifications" onClick={toggle} className="relative"><Bell className="h-4 w-4" />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-500 px-1 text-[9px] text-white">{unread}</span>}</Button>{open && <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-popover p-3 shadow-xl"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Notifications</span>{items.length > 0 && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { clearNotifications(); setItems([]) }}><Trash2 className="mr-1 h-3 w-3" /> Clear all</Button>}</div>{items.length ? <div className="mt-2 max-h-72 space-y-1 overflow-auto">{items.map((item) => <div key={item.id} className="rounded-xl p-2.5 text-sm hover:bg-muted"><p>{item.message || item.type}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p></div>)}</div> : <p className="py-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>}</div>}</div>
}
