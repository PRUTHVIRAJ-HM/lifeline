'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingBag,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Heart,
  IndianRupee,
  Code,
  Palette,
  Database,
  Brain,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { courses } from './data'

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [likedCourses, setLikedCourses] = useState(new Set())
  const [enrolledCourses, setEnrolledCourses] = useState(new Set())
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function checkEnrollments() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUser(user)
      
      const { data } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
      
      if (data) {
        setEnrolledCourses(new Set(data.map(e => e.course_id)))
      }
    }
    checkEnrollments()
  }, [])

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'data', name: 'Data Science', icon: Database },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'business', name: 'Business', icon: TrendingUp },
  ]

  // Courses are imported from ./data so the list is shared between marketplace grid and detail pages

  const toggleLike = (courseId) => {
    setLikedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'bestsellers' && course.bestseller) ||
      (activeTab === 'trending' && course.rating >= 4.8)
    return matchesCategory && matchesSearch && matchesTab
  })

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center space-x-2 bg-[#F5C832] text-gray-900 px-4 py-2 rounded-full mb-4 font-medium">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm">Course Marketplace</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  Browse Premium Courses<br />
                  <span className="text-[#F5C832]">from Expert Instructors</span>
                </h1>
                <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                  Explore thousands of professionally crafted courses to master new skills and advance your career
                </p>
                <div className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>890K+ Students Enrolled</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Award className="w-12 h-12 text-[#F5C832] mb-2" />
                  <div className="text-2xl font-bold">850+</div>
                  <div className="text-sm text-gray-300">Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Users className="w-12 h-12 text-[#F5C832] mb-2" />
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-gray-300">Instructors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'trending'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </button>
                <button
                  onClick={() => setActiveTab('bestsellers')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'bestsellers'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Bestsellers</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent w-64"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'bestsellers' ? 'Bestselling Courses' : 
               activeTab === 'trending' ? 'Trending Now' : 
               'Available Courses'}
            </h2>
            <p className="text-gray-600">{filteredCourses.length} courses found</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {course.bestseller && (
                    <div className="absolute top-3 left-3 bg-[#F5C832] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                      BESTSELLER
                    </div>
                  )}
                  <button
                    onClick={() => toggleLike(course.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-4 h-4 ${likedCourses.has(course.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Course Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm">{course.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({course.reviews.toLocaleString()})</span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 mb-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{(course.students / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="mb-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {course.level}
                    </span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4 text-gray-900" />
                        <span className="text-xl font-bold text-gray-900">{course.price}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400 line-through">{course.originalPrice}</span>
                      </div>
                    </div>
                    {enrolledCourses.has(course.id) ? (
                      <Link
                        href={`/marketplace/${course.id}/learn`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Go to Course
                      </Link>
                    ) : (
                      <Link
                        href={`/marketplace/${course.id}`}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Enroll
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
