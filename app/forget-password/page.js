'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E7F0] p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#2C3544] mb-2">
            Forgot password?
          </h2>
          <p className="text-gray-500">
            {success 
              ? "Check your email for a password reset link"
              : "Enter your email to receive a password reset link"
            }
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C3544] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-[#2C3544] hover:text-[#4169E1]">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              Password reset link sent! Check your email.
            </div>

            <Link 
              href="/login"
              className="block w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors text-center"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
