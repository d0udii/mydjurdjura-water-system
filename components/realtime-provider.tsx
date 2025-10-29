/**
 * Real-time Provider Component
 * Sets up real-time subscriptions for live updates
 */

'use client'

import { useRealtimeSubscription } from '@/lib/supabase-realtime-hooks'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSubscription()
  
  return <>{children}</>
}
