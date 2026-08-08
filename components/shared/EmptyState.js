import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyState({ title = 'Nothing here yet', description, actionLabel, onAction, icon: Icon = Inbox }) {
  return <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
    <Icon className="mx-auto h-7 w-7 text-muted-foreground" />
    <h3 className="mt-3 font-semibold">{title}</h3>
    {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
    {actionLabel && onAction && <Button className="mt-4" variant="outline" onClick={onAction}>{actionLabel}</Button>}
  </div>
}
