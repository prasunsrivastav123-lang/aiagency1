'use client'

import { useEffect, useState } from 'react'
import { saveNotes } from '@/lib/calling'

export default function NotesPanel({ callId, initialNotes = '', insertText = '' }) {
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState('Saved')
  useEffect(() => setNotes(initialNotes), [callId, initialNotes])
  useEffect(() => { if (!insertText) return; setNotes((value) => value ? `${value}\n${insertText}` : insertText) }, [insertText])
  useEffect(() => { if (!callId || notes === initialNotes) return undefined; setStatus('Saving…'); const timer = setTimeout(async () => { try { await saveNotes({ callId, notes, generateSummary: false }); setStatus('Saved ✓') } catch (error) { console.error('[NotesPanel] save failed:', error); setStatus('Save failed — retry') } }, 3000); return () => clearTimeout(timer) }, [callId, notes, initialNotes])
  return <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Call notes</h3><span className={`text-xs ${status.startsWith('Save failed') ? 'text-rose-300' : 'text-slate-400'}`}>{callId ? status : 'Start a call to save notes'}</span></div><textarea disabled={!callId} value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => setNotes((value) => value)} rows={4} placeholder="Capture key points, objections, and next steps…" className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-slate-600 disabled:opacity-50" /></section>
}
