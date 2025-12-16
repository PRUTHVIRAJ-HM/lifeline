'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, User, Activity, Trash2, CreditCard } from 'lucide-react'

export default function SettingsLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const sections = [
    { id: 'profile', name: 'Profile', icon: User, href: '/settings/profile' },
    { id: 'diagnostics', name: 'Diagnostics', icon: Activity, href: '/settings/diagnostics' },
    { id: 'account', name: 'Account', icon: Trash2, href: '/settings/account' },
    { id: 'billing', name: 'Billing & Memberships', icon: CreditCard, href: '/settings/billing' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = pathname === section.href
                return (
                  <button
                    key={section.id}
                    onClick={() => router.push(section.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`text-sm ${section.id === 'billing' && !isActive ? 'text-yellow-600 font-semibold' : ''} ${isActive ? 'text-white' : ''}`}>
                      {section.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
