'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Trash2 } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

export default function SettingsAccountPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Sign Out</h4>
                    <p className="text-sm text-gray-600 mt-1">Sign out of your account on this device</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap ml-4">Logout</button>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap ml-4">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
  )
}
