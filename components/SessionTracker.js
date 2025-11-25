'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionTracker() {
  useEffect(() => {
    const supabase = createClient()
    let startTime = Date.now()
    let isTracking = true

    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        isTracking = false
        return null
      }
      return user
    }

    // Save session time
    const saveSessionTime = async () => {
      const user = await checkUser()
      if (!user || !isTracking) return

      const today = new Date().toISOString().split('T')[0]
      const currentSessionTime = Math.floor((Date.now() - startTime) / 1000)
      
      // Get existing session data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('session_data')
        .eq('id', user.id)
        .single()

      const sessionData = profileData?.session_data || {}
      const todayTime = (sessionData[today] || 0) + currentSessionTime
      
      // Update with new time
      await supabase
        .from('profiles')
        .update({
          session_data: {
            ...sessionData,
            [today]: todayTime
          }
        })
        .eq('id', user.id)

      startTime = Date.now() // Reset start time after save
    }

    // Save every 5 minutes
    const saveInterval = setInterval(saveSessionTime, 300000)

    // Save on page unload
    const handleBeforeUnload = () => {
      saveSessionTime()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(saveInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveSessionTime() // Save final time on cleanup
    }
  }, [])

  return null // This component doesn't render anything
}
