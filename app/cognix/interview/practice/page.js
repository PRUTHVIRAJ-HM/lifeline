'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
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

export default function InterviewPracticePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const field = searchParams.get('field') || 'General'

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

  // Define subcategories for each field
  const subcategories = {
    'Data Analytics': [
      { id: 1, name: 'Data Analytics' },
      { id: 2, name: 'Advanced Data Analytics' },
      { id: 3, name: 'Business Intelligence' },
      { id: 4, name: 'Google Cloud Data Analytics' }
    ],
    'Digital Marketing and E-Commerce': [
      { id: 1, name: 'Digital Marketing Fundamentals' },
      { id: 2, name: 'E-Commerce Strategy' },
      { id: 3, name: 'Social Media Marketing' },
      { id: 4, name: 'SEO and SEM' }
    ],
    'IT Support': [
      { id: 1, name: 'IT Support Fundamentals' },
      { id: 2, name: 'System Administration' },
      { id: 3, name: 'Network Troubleshooting' },
      { id: 4, name: 'Customer Service' }
    ],
    'Project Management': [
      { id: 1, name: 'Project Management Basics' },
      { id: 2, name: 'Agile Methodologies' },
      { id: 3, name: 'Risk Management' },
      { id: 4, name: 'Stakeholder Management' }
    ],
    'UX Design': [
      { id: 1, name: 'UX Design Fundamentals' },
      { id: 2, name: 'User Research' },
      { id: 3, name: 'Prototyping' },
      { id: 4, name: 'Usability Testing' }
    ],
    'Cybersecurity': [
      { id: 1, name: 'Cybersecurity Basics' },
      { id: 2, name: 'Network Security' },
      { id: 3, name: 'Threat Analysis' },
      { id: 4, name: 'Security Operations' }
    ],
    'General': [
      { id: 1, name: 'Behavioral Questions' },
      { id: 2, name: 'Communication Skills' },
      { id: 3, name: 'Problem Solving' },
      { id: 4, name: 'Leadership' }
    ]
  }

  const currentSubcategories = subcategories[field] || subcategories['General']

  const handleSubcategorySelect = (subcategory) => {
    // Navigate to the interview session
    router.push(`/cognix/interview/session?field=${encodeURIComponent(field)}&subcategory=${encodeURIComponent(subcategory.name)}`)
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/cognix/interview')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-gray-700">{field}</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">interview</span>
              <span className="text-xl font-bold text-[#F5C832]">warmup</span>
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
                          router.push('http://localhost:3000/settings?tab=diagnostics')
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

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFAQ(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <button onClick={() => setShowFAQ(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How does Interview Warmup work?</h3>
                <p className="text-gray-600">Interview Warmup provides AI-powered practice interviews tailored to your field. Answer questions, get real-time transcription, and receive insights on your responses.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens to my practice recordings?</h3>
                <p className="text-gray-600">Your recordings are analyzed in real-time and then deleted. We don't store your audio or video data.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I practice multiple times?</h3>
                <p className="text-gray-600">Yes! You can practice as many times as you want. Each session generates new questions to help you improve.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How are questions selected?</h3>
                <p className="text-gray-600">Questions are curated based on your selected field and common interview scenarios, including behavioral and technical questions.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do I need a microphone?</h3>
                <p className="text-gray-600">Yes, a working microphone is required to practice your verbal responses. Make sure to allow microphone access when prompted.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTips(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interview Tips</h2>
              <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-[#F5C832]">📋</span>
                  Before the Interview
                </h3>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li>• Research the company and role thoroughly</li>
                  <li>• Prepare STAR (Situation, Task, Action, Result) examples</li>
                  <li>• Practice in a quiet, well-lit space</li>
                  <li>• Test your microphone and camera beforehand</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-[#F5C832]">💬</span>
                  During the Interview
                </h3>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li>• Take a moment to think before answering</li>
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Use specific examples from your experience</li>
                  <li>• Stay positive about past experiences</li>
                  <li>• Ask clarifying questions if needed</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-[#F5C832]">✨</span>
                  Best Practices
                </h3>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li>• Be authentic and genuine in your responses</li>
                  <li>• Show enthusiasm for the role and company</li>
                  <li>• Quantify achievements when possible</li>
                  <li>• Practice regularly to build confidence</li>
                  <li>• Review your insights after each session</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFeedback(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Feedback</h2>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              // Handle feedback submission
              setShowFeedback(false)
              alert('Thank you for your feedback!')
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to share?
                </label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                  rows="6"
                  placeholder="Tell us about your experience, report a bug, or suggest a feature..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#F5C832] rounded-xl text-gray-900 hover:bg-[#F5C832]/90 transition-colors font-medium"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What field do you want to practice for?
          </h1>
          <p className="text-gray-600">Choose a specific area within {field}</p>
        </div>

        <div className="space-y-4">
          {currentSubcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => handleSubcategorySelect(subcategory)}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-5 flex items-center justify-between hover:border-[#F5C832] hover:shadow-lg transition-all duration-200 group"
            >
              <span className="text-gray-900 text-lg font-semibold group-hover:text-gray-900">
                {subcategory.name}
              </span>
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#F5C832] transition-colors">
                <ChevronRight size={20} className="text-gray-600 group-hover:text-gray-900" />
              </div>
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-[#F5C832] rounded-xl">
          <h3 className="font-bold text-gray-900 mb-2">💡 Interview Tip</h3>
          <p className="text-sm text-gray-700">
            Select a subcategory to start practicing. You'll receive AI-generated questions tailored to your chosen field.
          </p>
        </div>
      </div>
    </div>
  )
}
