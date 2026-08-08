'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('[AgencyOS] view error:', error) }
  render() {
    if (!this.state.hasError) return this.props.children
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center"><h2 className="font-semibold">This section couldn’t load</h2><p className="mt-1 text-sm text-muted-foreground">Your work is safe. Please try again.</p><Button className="mt-4" variant="outline" onClick={() => this.setState({ hasError: false })}>Try again</Button></div>
  }
}
