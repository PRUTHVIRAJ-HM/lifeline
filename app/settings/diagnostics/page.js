'use client'
import { useEffect, useRef, useState } from 'react'
import { Activity, Check, Download, Mic, Upload, Video, Volume2, Wifi, X, Zap } from 'lucide-react'

function DiagnosticsSection() {
  const [cameraStream, setCameraStream] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [cameraStatus, setCameraStatus] = useState('idle')
  const [micStatus, setMicStatus] = useState('idle')
  const [micLevel, setMicLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [speedTestStatus, setSpeedTestStatus] = useState('idle')
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [ping, setPing] = useState(0)
  const [jitter, setJitter] = useState(0)
  const videoRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  const startCameraTest = async () => {
    try {
      setCameraStatus('testing')
      setErrorMessage('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraStatus('success')
    } catch (error) {
      console.error('Camera error:', error)
      setCameraStatus('error')
      setErrorMessage(error.message || 'Unable to access camera')
    }
  }

  const stopCameraTest = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop())
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
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setMicLevel(Math.min(100, Math.round((avg / 255) * 100)))
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
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null }
  }

  const startSpeedTest = async () => {
    try {
      setSpeedTestStatus('testing')
      setErrorMessage('')
      setDownloadSpeed(0); setUploadSpeed(0); setPing(0); setJitter(0)
      const pingTests = []
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('https://speed.cloudflare.com/__down?bytes=1', { cache: 'no-cache' })
        const end = performance.now()
        pingTests.push(end - start)
      }
      const avgPing = pingTests.reduce((a, b) => a + b, 0) / pingTests.length
      setPing(avgPing)
      const jitterVal = Math.sqrt(
        pingTests.reduce((sum, val) => sum + Math.pow(val - avgPing, 2), 0) / pingTests.length
      )
      setJitter(jitterVal)
      const downloadStart = performance.now()
      const downloadSize = 10 * 1024 * 1024
      const downloadResponse = await fetch(`https://speed.cloudflare.com/__down?bytes=${downloadSize}`, { cache: 'no-cache' })
      const reader = downloadResponse.body.getReader()
      let receivedLength = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        receivedLength += value.length
        const elapsed = (performance.now() - downloadStart) / 1000
        const speedMbps = (receivedLength * 8) / (elapsed * 1000000)
        setDownloadSpeed(speedMbps)
      }
      const downloadEnd = performance.now()
      const downloadDuration = (downloadEnd - downloadStart) / 1000
      const finalDownloadSpeed = (receivedLength * 8) / (downloadDuration * 1000000)
      setDownloadSpeed(finalDownloadSpeed)
      const uploadSize = 5 * 1024 * 1024
      const uploadData = new Uint8Array(uploadSize)
      const uploadStart = performance.now()
      await fetch('https://speed.cloudflare.com/__up', { method: 'POST', body: uploadData, cache: 'no-cache' })
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
    setDownloadSpeed(0); setUploadSpeed(0); setPing(0); setJitter(0)
  }

  useEffect(() => () => { stopCameraTest(); stopMicTest(); stopSpeedTest() }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-8">Diagnostics</h2>
      {errorMessage && (<div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">{errorMessage}</div>)}
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-lg"><Video className="w-6 h-6 text-blue-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Camera Test</h3>
                <p className="text-sm text-gray-500">Test your webcam functionality</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {cameraStatus === 'success' && (<span className="flex items-center text-sm text-green-600"><Check className="w-4 h-4 mr-1" />Working</span>)}
              {cameraStatus === 'error' && (<span className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />Error</span>)}
            </div>
          </div>
          {cameraStatus === 'testing' || cameraStatus === 'success' ? (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <button onClick={stopCameraTest} className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Stop Camera Test</button>
            </div>
          ) : (
            <button onClick={startCameraTest} disabled={cameraStatus === 'testing'} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {cameraStatus === 'testing' ? 'Starting Camera...' : 'Start Camera Test'}
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-lg"><Mic className="w-6 h-6 text-purple-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Microphone Test</h3>
                <p className="text-sm text-gray-500">Test your microphone and audio levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {micStatus === 'success' && (<span className="flex items-center text-sm text-green-600"><Check className="w-4 h-4 mr-1" />Working</span>)}
              {micStatus === 'error' && (<span className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />Error</span>)}
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
                  <div className={`absolute top-0 left-0 h-full transition-all duration-100 rounded-full ${micLevel > 80 ? 'bg-red-500' : micLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${micLevel}%` }} />
                </div>
                <p className="text-xs text-gray-500"><Volume2 className="w-3 h-3 inline mr-1" />Speak into your microphone to test audio levels</p>
              </div>
              <button onClick={stopMicTest} className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Stop Microphone Test</button>
            </div>
          ) : (
            <button onClick={startMicTest} disabled={micStatus === 'testing'} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {micStatus === 'testing' ? 'Starting Microphone...' : 'Start Microphone Test'}
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4"><div className="p-3 bg-gray-50 rounded-lg"><Activity className="w-6 h-6 text-gray-600" /></div><div><h3 className="font-semibold text-gray-900">System Information</h3><p className="text-sm text-gray-500">Browser and device details</p></div></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Browser</span><span className="font-medium text-gray-900">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Platform</span><span className="font-medium text-gray-900">{navigator.platform}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Language</span><span className="font-medium text-gray-900">{navigator.language}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-600">Online Status</span><span className={`font-medium ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>{navigator.onLine ? 'Online' : 'Offline'}</span></div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3"><div className="p-3 bg-green-50 rounded-lg"><Wifi className="w-6 h-6 text-green-600" /></div><div><h3 className="font-semibold text-gray-900">Network Speed Test</h3><p className="text-sm text-gray-500">Test your internet connection speed</p></div></div>
            <div className="flex items-center space-x-2">
              {speedTestStatus === 'complete' && (<span className="flex items-center text-sm text-green-600"><Check className="w-4 h-4 mr-1" />Complete</span>)}
              {speedTestStatus === 'error' && (<span className="flex items-center text-sm text-red-600"><X className="w-4 h-4 mr-1" />Error</span>)}
            </div>
          </div>
          {speedTestStatus === 'testing' || speedTestStatus === 'complete' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="80" cy="80" r="70" stroke="url(#downloadGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(downloadSpeed / 200, 1))}`} className="transition-all duration-500" />
                      <defs><linearGradient id="downloadGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient></defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><Download className="w-6 h-6 text-blue-600 mb-1" /><p className="text-3xl font-bold text-gray-900">{downloadSpeed.toFixed(1)}</p><p className="text-xs text-gray-500 font-medium">Mbps</p></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-3">Download</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="80" cy="80" r="70" stroke="url(#uploadGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(uploadSpeed / 100, 1))}`} className="transition-all duration-500" />
                      <defs><linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><Upload className="w-6 h-6 text-green-600 mb-1" /><p className="text-3xl font-bold text-gray-900">{uploadSpeed.toFixed(1)}</p><p className="text-xs text-gray-500 font-medium">Mbps</p></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-3">Upload</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"><div className="flex items-center space-x-2 mb-2"><Zap className="w-5 h-5 text-yellow-600" /><span className="text-sm font-medium text-gray-700">Ping</span></div><p className="text-2xl font-bold text-gray-900">{ping.toFixed(0)} <span className="text-sm font-normal text-gray-500">ms</span></p></div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"><div className="flex items-center space-x-2 mb-2"><Activity className="w-5 h-5 text-purple-600" /><span className="text-sm font-medium text-gray-700">Jitter</span></div><p className="text-2xl font-bold text-gray-900">{jitter.toFixed(1)} <span className="text-sm font-normal text-gray-500">ms</span></p></div>
              </div>
              {speedTestStatus === 'testing' && (<div className="flex items-center justify-center py-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div><span className="ml-3 text-sm text-gray-600">Testing connection speed...</span></div>)}
              {speedTestStatus === 'complete' && (<button onClick={stopSpeedTest} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">Run New Test</button>)}
            </div>
          ) : (
            <button onClick={startSpeedTest} disabled={speedTestStatus === 'testing'} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{speedTestStatus === 'testing' ? 'Testing...' : 'Start Speed Test'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsDiagnosticsPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <DiagnosticsSection />
    </div>
  )
}
