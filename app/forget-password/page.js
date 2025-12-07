'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email') // 'email', 'reset', 'success'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check if user is in a recovery session (after clicking email link)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session) {
          // User has valid recovery session, show password reset form
          setStep('reset')
        }
        setSessionLoading(false)
      } catch (err) {
        setSessionLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleSendResetLink = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forget-password`,
      })

      if (error) throw error

      setStep('success')
      setEmail('')
    } catch (error) {
      setError(error.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setStep('success')
      setPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
          <p className="text-gray-600 mt-4">Verifying your request...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex lg:flex-row flex-col">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#F5C832]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          {/* Logo/Icon */}
          <div className="mb-12 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-[#F5C832] rounded-3xl flex items-center justify-center transform rotate-6 shadow-2xl">
                <img src="/learning.png" alt="Academix Logo" className="w-full h-full object-contain p-3"/>            
              </div>
              
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl transform rotate-12">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-xl transform -rotate-12">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            {step === 'email' ? 'Need Help?' : 'Secure Your'}<br />
            <span className="text-[#F5C832]">{step === 'email' ? "We've Got You" : 'Account'}</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {step === 'email' 
              ? "Don't worry! Resetting your password is easy. We'll send you a link to recover access to your account."
              : "Create a strong new password to protect your account and get back to learning."
            }
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back to login - Mobile */}
          {step !== 'success' && (
            <Link href="/login" className="inline-flex items-center gap-2 text-[#2C3544] hover:text-[#4169E1] mb-6 lg:mb-10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>
          )}

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {step === 'email' && 'Reset password'}
              {step === 'reset' && 'Create new password'}
              {step === 'success' && 'All set!'}
            </h2>
            <p className="text-gray-600 text-base">
              {step === 'email' && 'Enter the email associated with your account to receive a password reset link'}
              {step === 'reset' && 'Enter a strong password to secure your account'}
              {step === 'success' && 'Your password has been reset successfully! Redirecting you to login...'}
            </p>
          </div>

          {/* STEP 1: Email Request */}
          {step === 'email' && (
            <form onSubmit={handleSendResetLink} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2C3544] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-[#2C3544] hover:text-[#4169E1]">
                  Log in
                </Link>
              </p>
            </form>
          )}

          {/* STEP 2: Success - Link Sent */}
          {step === 'success' && step !== 'reset' && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Check your email!</h3>
                <p className="text-green-700 text-sm">
                  We've sent a password reset link to your inbox
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Next steps:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#4169E1] text-white rounded-full text-xs font-bold">1</span>
                    <span>Check your email inbox (or spam folder)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#4169E1] text-white rounded-full text-xs font-bold">2</span>
                    <span>Click the reset password link</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#4169E1] text-white rounded-full text-xs font-bold">3</span>
                    <span>Create a new password</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#4169E1] text-white rounded-full text-xs font-bold">4</span>
                    <span>Log in with your new password</span>
                  </li>
                </ol>
              </div>

              {/* Didn't receive email */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
                <button
                  onClick={() => {
                    setStep('email')
                    setEmail('')
                    setError('')
                  }}
                  className="text-sm font-semibold text-[#4169E1] hover:text-[#2C3544] transition-colors"
                >
                  Try again with a different email
                </button>
              </div>

              <Link 
                href="/login"
                className="block w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors text-center"
              >
                Back to login
              </Link>
            </div>
          )}

          {/* STEP 3: Password Reset */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2C3544] mb-2">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>• At least 8 characters</p>
                  <p>• One uppercase letter (A-Z)</p>
                  <p>• One lowercase letter (a-z)</p>
                  <p>• One number (0-9)</p>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C3544] mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-[#2C3544] hover:text-[#4169E1]">
                  Log in
                </Link>
              </p>
            </form>
          )}

          {/* STEP 4: Success - Password Reset Complete */}
          {step === 'success' && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Password reset successful!</h3>
                <p className="text-green-700 text-sm">
                  Your password has been updated. Redirecting you to login...
                </p>
              </div>

              <Link 
                href="/login"
                className="block w-full bg-[#2C3544] text-white py-3 rounded-lg font-medium hover:bg-[#1f2937] transition-colors text-center"
              >
                Go to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
