'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  ChevronRight,
  Volume2,
  MoreVertical,
  FileQuestion,
  Lightbulb,
  MessageSquare,
  Mic
} from 'lucide-react'

export default function InterviewWarmupPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const fields = [
    { id: 1, name: 'Data Analytics' },
    { id: 2, name: 'Digital Marketing and E-Commerce' },
    { id: 3, name: 'IT Support' },
    { id: 4, name: 'Project Management' },
    { id: 5, name: 'UX Design' },
    { id: 6, name: 'Cybersecurity' },
    { id: 7, name: 'General' }
  ]

  const handleFieldSelect = (field) => {
    // Navigate to the next step with the selected field
    router.push(`/cognix/interview/practice?field=${encodeURIComponent(field.name)}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/cognix')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">Interview</span>
                <span className="text-xl font-bold text-[#F5C832]">Warmup</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Volume2 size={20} className="text-gray-700" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-700" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                      />
                      
                      {/* Menu Card */}
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-20">
                        <button 
                          onClick={() => {
                            setShowMenu(false)
                            setShowFAQ(true)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <FileQuestion size={20} className="text-gray-600" />
                          <span className="text-gray-700 font-medium">FAQ</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowMenu(false)
                            setShowTips(true)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Lightbulb size={20} className="text-gray-600" />
                          <span className="text-gray-700 font-medium">Interview tips</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowMenu(false)
                            setShowFeedback(true)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <MessageSquare size={20} className="text-gray-600" />
                          <span className="text-gray-700 font-medium">Send feedback</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowMenu(false)
                            router.push('/settings?tab=diagnostics')
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Mic size={20} className="text-gray-600" />
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-gray-700 font-medium">Microphone help</span>
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What field do you want to practice for?
            </h1>
            <p className="text-gray-600">Choose your interview domain to get started</p>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldSelect(field)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between hover:border-[#F5C832] hover:shadow-lg transition-all duration-200 group"
              >
                <span className="text-gray-900 text-lg font-semibold group-hover:text-gray-900">
                  {field.name}
                </span>
                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#F5C832] transition-colors">
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-gray-900" />
                </div>
              </button>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-[#F5C832] rounded-xl">
            <h3 className="font-bold text-gray-900 mb-2">🎯 Pro Tip</h3>
            <p className="text-sm text-gray-700">
              Practice makes perfect! Our AI will provide personalized feedback to help you improve your interview skills.
            </p>
          </div>
        </div>

        {/* FAQ Modal */}
        {showFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <button
                onClick={() => setShowFAQ(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">How does Interview Warmup work?</h3>
                <p className="text-gray-700">Interview Warmup helps you practice answering questions from various fields. Select a field, choose a subcategory, and start practicing with AI-generated questions tailored to your chosen domain.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Can I practice for multiple fields?</h3>
                <p className="text-gray-700">Yes! You can practice for as many fields as you like. Simply return to the main page and select a different field to begin a new practice session.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Is my practice data saved?</h3>
                <p className="text-gray-700">Your practice sessions are saved locally in your browser. This allows you to track your progress and review previous sessions.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Do I need a microphone?</h3>
                <p className="text-gray-700">A microphone is recommended for the best practice experience, especially if you want to practice verbal responses. You can test your microphone in the settings diagnostics section.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Interview Tips</h2>
              <button
                onClick={() => setShowTips(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border-2 border-[#F5C832] rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">💡 Before the Interview</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Research the company thoroughly</li>
                  <li>Review your resume and be ready to discuss your experience</li>
                  <li>Prepare questions to ask the interviewer</li>
                  <li>Test your technology (camera, microphone, internet)</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">🎯 During the Interview</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Use the STAR method (Situation, Task, Action, Result)</li>
                  <li>Listen carefully to the full question before answering</li>
                  <li>Be specific with examples from your experience</li>
                  <li>Ask for clarification if you don't understand a question</li>
                  <li>Show enthusiasm and maintain a positive attitude</li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">✅ Best Practices</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Practice your answers out loud, not just in your head</li>
                  <li>Keep answers concise (1-2 minutes for most questions)</li>
                  <li>Focus on your achievements and what you learned</li>
                  <li>Be honest - it's okay to say "I don't know" sometimes</li>
                  <li>Send a thank-you email within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Send Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What would you like to share?
                </label>
                <textarea
                  rows="6"
                  placeholder="Tell us about your experience, report a bug, or suggest a feature..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Thank you for your feedback!')
                  setShowFeedback(false)
                }}
                className="px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}
