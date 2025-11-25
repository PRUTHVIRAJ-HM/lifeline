'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      console.log('[Root/Auth] code param:', code)
      
      if (code) {
        // Handle OAuth callback
        try {
          console.log('[Root/Auth] Exchanging code for session...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('[Root/Auth] Exchange error:', error)
            throw error
          }
          console.log('[Root/Auth] Session exchange success, redirecting to /dashboard')
          router.push('/dashboard')
        } catch (error) {
          console.error('Auth error:', error)
          router.push('/login')
        }
      } else {
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser()
        console.log('[Root/Auth] Existing user check:', !!user)
        
        if (user) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      }
    }

    handleAuth()
  }, [router, supabase, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-lg">Loading...</div>
    </div>
  )
}
