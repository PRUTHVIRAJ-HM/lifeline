'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Brain,
  MessageSquare,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight,
  Users
} from 'lucide-react'

export default function CognixPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  const cognixProducts = [
    {
      id: 'assist',
      name: 'Cognix Assist',
      description: 'Your AI-powered learning companion that provides instant answers and personalized study guidance',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      features: ['24/7 AI Support', 'Personalized Learning', 'Instant Answers'],
      route: '/cognix/assist'
    },
    {
      id: 'builder',
      name: 'Cognix Builder',
      description: 'Build professional resumes with guided prompts and download them as PDF in minutes',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      features: ['Resume Builder', 'PDF Export', 'Professional Templates'],
      route: '/cognix/builder'
    },
    {
      id: 'interview',
      name: 'Cognix Interview',
      description: 'Practice interviews with AI-powered mock sessions and get real-time feedback',
      icon: Users,
      color: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      features: ['Mock Interviews', 'Real-time Feedback', 'Performance Analysis'],
      route: '/cognix/interview'
    }
  ]

  const handleProductClick = (route) => {
    router.push(route)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F5C832] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-900 rounded-full opacity-5 blur-3xl"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-8 pt-12 pb-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-[#F5C832]" />
                  <span className="text-sm font-medium">Powered by Advanced AI</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Welcome to
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                    Cognix Suite
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                  Your intelligent learning ecosystem designed to accelerate your growth. 
                  From AI-powered assistance to professional development tools, 
                  everything you need is right here.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">AI Models Active</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">50K+ Students</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
                    <Sparkles className="w-4 h-4 text-[#F5C832]" />
                    <span className="text-sm font-medium text-gray-700">99.9% Uptime</span>
                  </div>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Main Brain Icon Container */}
                  <div className="relative w-64 h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <Brain className="w-32 h-32 text-[#F5C832]" strokeWidth={1.5} />
                  </div>
                  
                  {/* Floating Cards */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center transform -rotate-12 animate-bounce">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center transform rotate-12">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="absolute top-1/2 -right-8 w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <FileText className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Explore AI-Powered Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our suite of intelligent tools designed to enhance every aspect of your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cognixProducts.map((product, index) => {
              const Icon = product.icon
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.route)}
                  className="group relative bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 ${product.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow border-2 ${product.borderColor}`}>
                        <Icon className={`w-10 h-10 ${product.iconColor}`} />
                      </div>
                      <div className="p-3 bg-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white">
                        <ArrowRight className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${product.iconColor.replace('text-', 'bg-')}`}></div>
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">
                        Get Started →
                      </span>
                      <div className={`px-3 py-1 bg-gray-100 rounded-full text-xs font-medium ${product.iconColor} group-hover:bg-white`}>
                        Free
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-8 pb-16">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">Join Thousands of Learners</h3>
                <p className="text-gray-300">Experience the future of AI-powered education</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#F5C832] mb-2">50K+</div>
                  <div className="text-sm text-gray-300">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#F5C832] mb-2">1M+</div>
                  <div className="text-sm text-gray-300">AI Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#F5C832] mb-2">98%</div>
                  <div className="text-sm text-gray-300">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#F5C832] mb-2">24/7</div>
                  <div className="text-sm text-gray-300">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

