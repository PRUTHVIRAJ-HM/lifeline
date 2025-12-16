'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  ChevronLeft,
  Save,
  Camera,
  Eye,
  EyeOff,
  Activity,
  Trash2,
  CreditCard,
  ExternalLink,
  Linkedin,
  Video,
  Mic,
  Volume2,
  X,
  Check,
  Wifi,
  Download,
  Upload,
  Zap
} from 'lucide-react'

// Diagnostics Component
function DiagnosticsSection() {
  const [cameraStream, setCameraStream] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [cameraStatus, setCameraStatus] = useState('idle') // idle, testing, success, error
  const [micStatus, setMicStatus] = useState('idle')
  const [micLevel, setMicLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [speedTestStatus, setSpeedTestStatus] = useState('idle') // idle, testing, complete, error
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [ping, setPing] = useState(0)
  const [jitter, setJitter] = useState(0)
  const videoRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const speedTestRef = useRef(null)

  const startCameraTest = async () => {
    try {
      setCameraStatus('testing')
      setErrorMessage('')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setCameraStream(stream)
      setCameraStatus('success')
    } catch (error) {
      console.error('Camera error:', error)
      setCameraStatus('error')
      setErrorMessage(error.message || 'Unable to access camera')
    }
  }

  const stopCameraTest = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setCameraStream(null)
      setCameraStatus('idle')
    }
  }

  const startMicTest = async () => {
    try {
      setMicStatus('testing')
      setErrorMessage('')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicStream(stream)
      
      // Create audio context and analyser
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Start monitoring audio level
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setMicLevel(Math.min(100, (average / 128) * 100))
        animationFrameRef.current = requestAnimationFrame(checkLevel)
      }
      
      checkLevel()
      setMicStatus('success')
    } catch (error) {
      console.error('Microphone error:', error)
      setMicStatus('error')
      setErrorMessage(error.message || 'Unable to access microphone')
    }
  }

  const stopMicTest = () => {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop())
      setMicStream(null)
      setMicStatus('idle')
      setMicLevel(0)
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  const startSpeedTest = async () => {
    try {
      setSpeedTestStatus('testing')
      setErrorMessage('')
      setDownloadSpeed(0)
      setUploadSpeed(0)
      setPing(0)
      setJitter(0)

      // Test Ping
      const pingTests = []
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('https://www.google.com/generate_204', { 
          method: 'HEAD',
          cache: 'no-cache'
        }).catch(() => {})
        const end = performance.now()
        pingTests.push(end - start)
      }
      
      const avgPing = pingTests.reduce((a, b) => a + b, 0) / pingTests.length
      setPing(avgPing)
      
      // Calculate jitter (variation in ping)
      const jitterVal = Math.sqrt(
        pingTests.reduce((sum, val) => sum + Math.pow(val - avgPing, 2), 0) / pingTests.length
      )
      setJitter(jitterVal)

      // Test Download Speed
      const downloadStart = performance.now()
      const downloadSize = 10 * 1024 * 1024 // 10MB
      
      // Using a reliable test file
      const downloadResponse = await fetch(
        `https://speed.cloudflare.com/__down?bytes=${downloadSize}`,
        { cache: 'no-cache' }
      )
      
      const reader = downloadResponse.body.getReader()
      let receivedLength = 0
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        receivedLength += value.length
        
        // Update download speed in real-time
        const elapsed = (performance.now() - downloadStart) / 1000
        const speedMbps = (receivedLength * 8) / (elapsed * 1000000)
        setDownloadSpeed(speedMbps)
      }
      
      const downloadEnd = performance.now()
      const downloadDuration = (downloadEnd - downloadStart) / 1000
      const finalDownloadSpeed = (receivedLength * 8) / (downloadDuration * 1000000)
      setDownloadSpeed(finalDownloadSpeed)

      // Test Upload Speed
      const uploadSize = 5 * 1024 * 1024 // 5MB
      const uploadData = new Uint8Array(uploadSize)
      
      const uploadStart = performance.now()
      await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: uploadData,
        cache: 'no-cache'
      })
      const uploadEnd = performance.now()
      
      const uploadDuration = (uploadEnd - uploadStart) / 1000
      const finalUploadSpeed = (uploadSize * 8) / (uploadDuration * 1000000)
      setUploadSpeed(finalUploadSpeed)

      setSpeedTestStatus('complete')
    } catch (error) {
      console.error('Speed test error:', error)
      setSpeedTestStatus('error')
      setErrorMessage('Unable to complete speed test. Please check your connection.')
    }
  }

  const stopSpeedTest = () => {
    setSpeedTestStatus('idle')
    setDownloadSpeed(0)
    setUploadSpeed(0)
    setPing(0)
    setJitter(0)
  }

  useEffect(() => {
    return () => {
      stopCameraTest()
      stopMicTest()
      stopSpeedTest()
    }
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-8">Diagnostics</h2>
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Camera Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Camera Test</h3>
                <p className="text-sm text-gray-500">Test your webcam functionality</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {cameraStatus === 'success' && (
                <span className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  Working
                </span>
              )}
              {cameraStatus === 'error' && (
                <span className="flex items-center text-sm text-red-600">
                  <X className="w-4 h-4 mr-1" />
                  Error
                </span>
              )}
            </div>
          </div>

          {cameraStatus === 'testing' || cameraStatus === 'success' ? (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={stopCameraTest}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera Test
              </button>
            </div>
          ) : (
            <button
              onClick={startCameraTest}
              disabled={cameraStatus === 'testing'}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cameraStatus === 'testing' ? 'Starting Camera...' : 'Start Camera Test'}
            </button>
          )}
        </div>

        {/* Microphone Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Microphone Test</h3>
                <p className="text-sm text-gray-500">Test your microphone and audio levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {micStatus === 'success' && (
                <span className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  Working
                </span>
              )}
              {micStatus === 'error' && (
                <span className="flex items-center text-sm text-red-600">
                  <X className="w-4 h-4 mr-1" />
                  Error
                </span>
              )}
            </div>
          </div>

          {micStatus === 'testing' || micStatus === 'success' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Audio Level</span>
                  <span className="font-medium text-gray-900">{Math.round(micLevel)}%</span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-100 rounded-full ${
                      micLevel > 80 ? 'bg-red-500' : micLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  <Volume2 className="w-3 h-3 inline mr-1" />
                  Speak into your microphone to test audio levels
                </p>
              </div>
              <button
                onClick={stopMicTest}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Microphone Test
              </button>
            </div>
          ) : (
            <button
              onClick={startMicTest}
              disabled={micStatus === 'testing'}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {micStatus === 'testing' ? 'Starting Microphone...' : 'Start Microphone Test'}
            </button>
          )}
        </div>

        {/* System Info */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Activity className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">System Information</h3>
              <p className="text-sm text-gray-500">Browser and device details</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Browser</span>
              <span className="font-medium text-gray-900">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Platform</span>
              <span className="font-medium text-gray-900">{navigator.platform}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Language</span>
              <span className="font-medium text-gray-900">{navigator.language}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Online Status</span>
              <span className={`font-medium ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Network Speed Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Network Speed Test</h3>
                <p className="text-sm text-gray-500">Test your internet connection speed</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {speedTestStatus === 'complete' && (
                <span className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  Complete
                </span>
              )}
              {speedTestStatus === 'error' && (
                <span className="flex items-center text-sm text-red-600">
                  <X className="w-4 h-4 mr-1" />
                  Error
                </span>
              )}
            </div>
          </div>

          {speedTestStatus === 'testing' || speedTestStatus === 'complete' ? (
            <div className="space-y-6">
              {/* Speed Gauges */}
              <div className="grid grid-cols-2 gap-6 py-4">
                {/* Download Speed Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#downloadGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(downloadSpeed / 200, 1))}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Download className="w-6 h-6 text-blue-600 mb-1" />
                      <p className="text-3xl font-bold text-gray-900">
                        {downloadSpeed.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Mbps</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-3">Download</p>
                </div>

                {/* Upload Speed Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#uploadGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(uploadSpeed / 100, 1))}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-green-600 mb-1" />
                      <p className="text-3xl font-bold text-gray-900">
                        {uploadSpeed.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Mbps</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-3">Upload</p>
                </div>
              </div>

              {/* Ping and Jitter */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Ping</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {ping.toFixed(0)} <span className="text-sm font-normal text-gray-500">ms</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Jitter</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {jitter.toFixed(1)} <span className="text-sm font-normal text-gray-500">ms</span>
                  </p>
                </div>
              </div>

              {speedTestStatus === 'testing' && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-sm text-gray-600">Testing connection speed...</span>
                </div>
              )}

              {speedTestStatus === 'complete' && (
                <button
                  onClick={stopSpeedTest}
                  className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Run New Test
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={startSpeedTest}
              disabled={speedTestStatus === 'testing'}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {speedTestStatus === 'testing' ? 'Testing...' : 'Start Speed Test'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const [paying, setPaying] = useState(false)
  const [payMessage, setPayMessage] = useState('')
  const [payments, setPayments] = useState([])
  const [currentPlanName, setCurrentPlanName] = useState('Free')
  // Auto-select diagnostics tab if ?tab=diagnostics is present
  useEffect(() => {
    // Redirect base settings to profile for now
    router.push('/settings/profile')
  }, [])
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileInputRef = useRef(null)
  
  // Form states
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    location: '',
    portfolioLink: '',
    linkedinProfile: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    projectUpdates: true,
    weeklyDigest: false
  })
  
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Load Razorpay script once
  useEffect(() => {
    const scriptId = 'razorpay-checkout'
    if (typeof window !== 'undefined' && !document.getElementById(scriptId)) {
      const s = document.createElement('script')
      s.id = scriptId
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  async function createOrder(amount) {
    const res = await fetch('/api/billing/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    if (!res.ok) throw new Error('Unable to create order')
    return res.json()
  }

  async function startCheckout(planName, amountInRupees) {
    try {
      setPaying(true)
      setPayMessage('')
      const amount = amountInRupees * 100
      const { orderId, key } = await createOrder(amount)

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Academix',
        description: `${planName} Membership`,
        order_id: orderId,
        theme: { color: '#0EA5E9' },
        handler: async function (response) {
          // Persist payment to Supabase
          try {
            const { error } = await supabase
              .from('payments')
              .insert({
                user_id: user?.id,
                plan_name: planName,
                amount_rupees: amountInRupees,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature,
                status: 'success'
              })
            if (error) throw error
            setPayMessage('Payment successful! Membership activated.')
            // Refresh billing history
            await fetchPayments()
          } catch (err) {
            setPayMessage('Payment succeeded but logging failed: ' + (err.message || 'Unknown error'))
          }
        },
        modal: {
          ondismiss: function () {
            setPayMessage('Payment cancelled')
          },
        },
        prefill: {
          name: user?.user_metadata?.full_name || 'Academix User',
          email: user?.email || 'user@example.com',
          contact: '9999999999',
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      setPayMessage(e.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  async function fetchPayments() {
    if (!user) return
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setPayments(data)
      const latest = data.find((p) => p.status === 'success')
      if (latest?.plan_name) setCurrentPlanName(latest.plan_name)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || ''
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          setProfileData({
            fullName: newProfile.full_name || '',
            email: newProfile.email || user.email || '',
            bio: newProfile.bio || '',
            location: newProfile.location || '',
            portfolioLink: newProfile.portfolio_link || '',
            linkedinProfile: newProfile.linkedin_profile || ''
          })
          setAvatarUrl(newProfile.avatar_url || '')
          if (newProfile.notifications) {
            setNotifications(newProfile.notifications)
          }
          if (newProfile.preferences) {
            setPreferences(newProfile.preferences)
          }
        }
      } else {
        setProfileData({
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          bio: profile.bio || '',
          location: profile.location || '',
          portfolioLink: profile.portfolio_link || '',
          linkedinProfile: profile.linkedin_profile || ''
        })
        setAvatarUrl(profile.avatar_url || '')
        if (profile.notifications) {
          setNotifications(profile.notifications)
        }
        if (profile.preferences) {
          setPreferences(profile.preferences)
        }
      }

      setLoading(false)
      // Prefetch payments after user loads
      fetchPayments()
    }

    getUser()
  }, [router, supabase])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      setMessage({ type: '', text: '' })

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' })
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 2MB' })
        return
      }

      // Create a unique filename with user-specific folder
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Also update user metadata for backward compatibility
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      setAvatarUrl(publicUrl)
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' })
    } catch (error) {
      console.error('Avatar upload error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          bio: profileData.bio,
          location: profileData.location,
          portfolio_link: profileData.portfolioLink,
          linkedin_profile: profileData.linkedinProfile,
          avatar_url: avatarUrl,
          email: profileData.email
        })
        .eq('id', user.id)

      if (error) throw error

      // Also update user metadata for backward compatibility
      await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          avatar_url: avatarUrl
        }
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setSaving(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update notifications in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ notifications })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Notification preferences updated!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update preferences in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Preferences updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

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
                return (
                  <button
                    key={section.id}
                    onClick={() => router.push(section.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                      activeSection === section.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`text-sm ${section.id === 'billing' && activeSection !== section.id ? 'text-yellow-600 font-semibold' : ''} ${activeSection === section.id ? 'text-white' : ''}`}>
                      {section.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              {/* Message Display */}
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Profile Section moved to /settings/profile */}
              {activeSection === 'profile' && (
                <div className="text-gray-700">
                  <p>Profile settings have moved.</p>
                  <button onClick={() => router.push('/settings/profile')} className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg">Go to Profile</button>
                </div>
              )}

              {/* Preferences Section - Removed */}

              {/* Diagnostics moved to /settings/diagnostics */}
              {activeSection === 'diagnostics' && (
                <div className="text-gray-700">
                  <p>Diagnostics have moved.</p>
                  <button onClick={() => router.push('/settings/diagnostics')} className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg">Go to Diagnostics</button>
                </div>
              )}

              {/* Account moved to /settings/account */}
              {activeSection === 'account' && (
                <div className="text-gray-700">
                  <p>Account settings have moved.</p>
                  <button onClick={() => router.push('/settings/account')} className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg">Go to Account</button>
                </div>
              )}

              {/* Billing Section */}
              {activeSection === 'billing' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-8">Billing & Memberships</h2>
                  
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-8 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-300 mb-1">Current Plan</p>
                        <h3 className="text-2xl font-bold">{currentPlanName === 'Free' ? 'Free Plan' : `${currentPlanName} Plan`}</h3>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-sm font-medium">{currentPlanName === 'Free' ? 'Free Tier' : 'Paid Tier'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Plans */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Basic Plan */}
                      <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-900">Free</h4>
                          <p className="text-sm text-gray-600 mt-1">Perfect for beginners</p>
                        </div>
                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">Free</span>
                            <span className="text-gray-600 ml-2">/year</span>
                          </div>
                        </div>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Access to 5 courses</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">AI assistance (100 queries/month)</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Interview Preperation</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Resume Builder</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Community</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Feeds</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Analytics</span>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                          Free
                        </button>
                      </div>

                      {/* Pro Plan - Highlighted */}
                      <div className="border-2 border-[#F5C832] rounded-xl p-6 relative shadow-xl transform scale-105">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5C832] text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </div>
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-900">Pro</h4>
                          <p className="text-sm text-gray-600 mt-1">For serious learners</p>
                        </div>
                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">₹999</span>
                            <span className="text-gray-600 ml-2">/year</span>
                          </div>
                        </div>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Access to 15 courses</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">AI assistance (500 queries/month)</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Interview Preperation</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Resume Builder</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Community</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Feeds</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Analytics</span>
                          </div>
                        </div>
                        <button
                          disabled={paying}
                          onClick={() => startCheckout('Pro', 999)}
                          className="w-full py-3 bg-[#F5C832] text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors font-bold disabled:opacity-50"
                        >
                          {paying ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                      </div>

                      {/* Enterprise Plan */}
                      <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-900">Supreme</h4>
                          <p className="text-sm text-gray-600 mt-1">Advanced learners</p>
                        </div>
                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">₹1699</span>
                            <span className="text-gray-600 ml-2">/year</span>
                          </div>
                        </div>
                        <div className="space-y-3 mb-6">
                           <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Access to 30 courses</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">AI assistance (Unlimited queries/month)</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Interview Preperation</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Resume Builder</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Community</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Feeds</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Analytics</span>
                          </div>
                        </div>
                        <button
                          disabled={paying}
                          onClick={() => startCheckout('Supreme', 1699)}
                          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                        >
                          {paying ? 'Processing...' : 'Upgrade to Supreme'}
                        </button>
                      </div>
                    </div>
                    {payMessage && (
                      <div className="mt-4 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">{payMessage}</div>
                    )}
                  </div>


                  {/* Billing History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                          <div>Date</div>
                          <div>Description</div>
                          <div>Payment ID</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                      </div>
                      {payments && payments.length > 0 ? (
                        <div>
                          {payments.map((p) => (
                            <div key={p.id} className="px-6 py-3 border-t border-gray-100">
                              <div className="grid grid-cols-5 gap-4 text-sm">
                                <div className="text-gray-700">{new Date(p.created_at).toLocaleString()}</div>
                                  <div className="text-gray-900 font-medium">{p.plan_name} Membership</div>
                                <div className="text-gray-700 truncate">{p.razorpay_payment_id || '-'}</div>
                                <div className="text-gray-900 font-semibold">₹{p.amount_rupees}</div>
                                <div className={`font-semibold ${p.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{p.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">No billing history available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
