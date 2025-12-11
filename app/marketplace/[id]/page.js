'use client'

import { useState, use } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { courses } from '../data'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import {
  Star,
  Users,
  Clock,
  IndianRupee,
  CheckCircle2,
  PlayCircle,
  ArrowLeft
} from 'lucide-react'

export default function CourseDetailPage({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Unwrap params Promise with React.use()
  const { id } = use(params)
  const courseId = id

  if (!courseId) {
    return notFound()
  }

  const course = courses.find((c) => String(c.id) === String(courseId))

  if (!course) {
    return notFound()
  }

  const handlePurchase = async () => {
    setLoading(true)
    try {
      // Get user first
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        alert('Please login to purchase courses')
        router.push('/login')
        return
      }

      // Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          currency: 'INR',
          courseId: course.id,
          courseName: course.title,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed')
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Lifeline Academy',
        description: course.title,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course.id,
              userId: user.id,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            // Add course to curriculum table
            try {
              const supabase = (await import('@/lib/supabase/client')).createClient()
              const { data: { user } } = await supabase.auth.getUser()
              
              if (user) {
                await supabase.from('courses').insert({
                  user_id: user.id,
                  title: course.title,
                  description: course.description,
                  instructor: course.instructor,
                  duration: course.duration,
                  level: course.level,
                  chapters: course.chapters,
                  source: 'marketplace',
                  marketplace_id: course.id,
                  enrolled_at: new Date().toISOString(),
                })
              }
            } catch (err) {
              console.error('Failed to add to curriculum:', err)
            }
            
            alert('Payment successful! Redirecting to course...')
            router.push(`/marketplace/${course.id}/learn`)
          } else {
            alert('Payment verification failed')
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          email: user.email || '',
        },
        theme: {
          color: '#000000',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description)
      })
      rzp.open()
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/marketplace" className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Back to marketplace
              </Link>
              <span>•</span>
              <span className="capitalize">{course.category}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 text-lg">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                    <span className="text-gray-500 font-normal">({course.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="text-gray-500">Last updated {course.updated}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{course.level}</span>
                  {course.bestseller && (
                    <span className="px-3 py-1 bg-[#F5C832] text-gray-900 rounded-full text-sm font-semibold">Bestseller</span>
                  )}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                      <IndianRupee className="w-5 h-5" />
                      {course.price}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 line-through">
                      <IndianRupee className="w-4 h-4" />
                      {course.originalPrice}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {course.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Purchase course'}
                  </button>
                  <Link
                    href="#chapters"
                    className="w-full py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                  >
                    View chapter contents
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          {/* What you will learn */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What you will learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.outcomes?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Includes */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">This course includes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.includes?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Chapters */}
          <section id="chapters" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chapter contents</h2>
              <div className="text-sm text-gray-600">Total duration: {course.duration}</div>
            </div>
            <div className="space-y-4">
              {course.chapters?.map((chapter, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <PlayCircle className="w-5 h-5 text-gray-700" />
                      <span>{chapter.title}</span>
                    </div>
                    <span className="text-sm text-gray-600">{chapter.duration}</span>
                  </div>
                  <div className="space-y-2">
                    {chapter.lessons?.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <span>{lesson.title}</span>
                        <span className="text-gray-500">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
