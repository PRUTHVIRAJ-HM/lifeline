'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutGrid, 
  Settings, 
  Bell, 
  Search,
  Brain,
  BookOpen,
  ClipboardCheck,
  Rss,
  MessageCircle,
  LogOut,
  ChevronDown,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { FEATURES, hasAccess } from '@/lib/plan'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [currentPlanName, setCurrentPlanName] = useState('Free')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Fetch latest successful payment to determine current plan
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (payments && payments.length) {
        const latest = payments.find((p) => p.status === 'success')
        if (latest?.plan_name) setCurrentPlanName(latest.plan_name)
      }
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  const gotoOrUpgrade = (path, featureKey) => {
    if (hasAccess(currentPlanName, featureKey)) {
      router.push(path)
    } else {
      router.push('/settings/billing')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarMinimized ? 'w-20' : 'w-60'} bg-white border-r border-gray-200 flex flex-col fixed h-screen left-0 top-0 overflow-y-auto transition-all duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className={`flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-2'}`}>
            <div className="w-8 h-8 bg-[#F5C832] rounded-lg flex items-center justify-center text-xl p-1">
              <img src="/learning.png" alt="Academix Logo" className="w-full h-full object-contain"/>            
            </div>
            {!sidebarMinimized && (
              <span className="text-xl font-bold">Academix</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/dashboard') && !pathname.includes('/cognix') && !pathname.includes('/curriculum')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Overview' : ''}
              >
                <LayoutGrid size={20} />
                {!sidebarMinimized && <span>Overview</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/cognix', FEATURES.cognix)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/cognix')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Cognix' : ''}
              >
                <Brain size={20} />
                {!sidebarMinimized && <span>Cognix</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/curriculum', FEATURES.curriculum)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/curriculum')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Curriculum' : ''}
              >
                <BookOpen size={20} />
                {!sidebarMinimized && <span>Curriculum</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/arena', FEATURES.arena)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/arena')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Arena' : ''}
              >
                <Sparkles size={20} />
                {!sidebarMinimized && <span>Arena</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/assignment', FEATURES.assignment)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/assignment')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Assignment' : ''}
              >
                <ClipboardCheck size={20} />
                {!sidebarMinimized && <span>Assignment</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/feeds', FEATURES.feeds)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/feeds')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Feeds' : ''}
              >
                <Rss size={20} />
                {!sidebarMinimized && <span>Feeds</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoOrUpgrade('/conversations', FEATURES.conversations)}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/conversations')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Conversations' : ''}
              >
                <MessageCircle size={20} />
                {!sidebarMinimized && <span>Conversations</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/settings')}
                className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive('/settings')
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarMinimized ? 'Settings' : ''}
              >
                <Settings size={20} />
                {!sidebarMinimized && <span>Settings</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className={`w-full flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}
            title={sidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {sidebarMinimized ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span>Minimize</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarMinimized ? 'ml-20' : 'ml-60'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hello, {profile?.full_name || 'there'} 
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500 text-sm">Let's learn something new today!</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-900 text-white">
                  {currentPlanName === 'Free' ? 'Free Tier' : `${currentPlanName} Tier`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search from courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent"
                />
              </div>

             
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-sm font-semibold">
                      {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">View Profile</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        router.push('/settings')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
