'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Code,
  Palette,
  Video,
  Database,
  Layout,
  Globe,
  Smartphone,
  Server,
  Search,
  Filter,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  Star,
  Users,
  BarChart3
} from 'lucide-react'

export default function CurriculumPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [arenaCourses, setArenaCourses] = useState([])
  const [courseProgress, setCourseProgress] = useState({}) // { courseId: progress }
  const [notification, setNotification] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Get course progress from Supabase
  const getCourseProgress = (courseId, chapters) => {
    const progress = courseProgress[courseId]
    if (progress !== undefined) return progress
    
    // Calculate from chapters if no progress data
    if (!chapters) return 0
    const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)
    return totalLessons === 0 ? 0 : 0
  }

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load enrolled courses (source = 'curriculum')
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'curriculum')
        .order('enrolled_at', { ascending: false })

      if (coursesError) {
        console.error('Error loading courses:', coursesError)
      } else {
        setArenaCourses(courses || [])
      }

      // Load course progress for all courses
      if (courses && courses.length > 0) {
        const courseIds = courses.map(c => c.id)
        const { data: progressData, error: progressError } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('course_id', courseIds)

        if (!progressError && progressData) {
          const progressMap = {}
          progressData.forEach(p => {
            const course = courses.find(c => c.id === p.course_id)
            if (course && course.chapters) {
              const totalLessons = course.chapters.reduce((acc, chapter) => 
                acc + (chapter.lessons?.length || 0), 0)
              const completedCount = Array.isArray(p.completed_lessons) ? p.completed_lessons.length : 0
              progressMap[p.course_id] = totalLessons > 0 
                ? Math.round((completedCount / totalLessons) * 100)
                : 0
            }
          })
          setCourseProgress(progressMap)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'web', name: 'Web Development', icon: Globe },
    { id: 'mobile', name: 'Mobile Dev', icon: Smartphone },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'data', name: 'Data Science', icon: BarChart3 },
    { id: 'backend', name: 'Backend', icon: Server }
  ]

  const allCourses = [
    ...arenaCourses.map(course => ({
      ...course,
      enrolled: true,
      icon: BookOpen,
      color: 'bg-gray-50',
      iconColor: 'text-gray-900',
      borderColor: 'border-gray-200',
      skills: course.goals ? course.goals.split(',').map(g => g.trim()) : [],
      category: 'arena',
      rating: 4.8,
      students: 1000,
      duration: course.duration || '8 hours',
      lessons: course.chapters?.length || 8,
      level: course.level || 'Beginner',
      progress: 0,
      description: course.description || 'AI-generated course',
    }))
  ]

  const stats = [
    {
      label: 'Courses Enrolled',
      value: allCourses.filter(c => c.enrolled).length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ]

  const filteredCourses = allCourses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.skills && course.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Curriculum</h1>
                <p className="text-gray-600">Continue your learning journey</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-900" />
                    <div>
                      <p className="text-sm text-gray-500">Enrolled Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{allCourses.filter(c => c.enrolled).length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className={`p-4 rounded-xl ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {notification.message}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by enrolling in courses from the Arena</p>
              <button
                onClick={() => router.push('/arena')}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Browse Arena
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const Icon = course.icon
                const progress = getCourseProgress(course.id, course.chapters)
                const actionLabel = progress === 0 ? 'Start Learning' : 'Continue Learning'
                
                const handleReset = async () => {
                  if (!user) return
                  
                  try {
                    await supabase
                      .from('course_progress')
                      .delete()
                      .eq('user_id', user.id)
                      .eq('course_id', course.id)

                    setCourseProgress(prev => {
                      const updated = { ...prev }
                      delete updated[course.id]
                      return updated
                    })
                    
                    showNotification('Course progress reset successfully!', 'success')
                    window.location.reload()
                  } catch (error) {
                    console.error('Error resetting progress:', error)
                    showNotification('Failed to reset progress', 'error')
                  }
                }

                return (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Course Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-[#F5C832] rounded-xl flex items-center justify-center">
                          <Icon className="text-gray-900" size={28} />
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                          {course.level}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-gray-400" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={16} className="text-gray-400" />
                          <span>{course.lessons} lessons</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/curriculum/${course.id}`)}
                          className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          {progress === 0 ? <Play size={16} /> : <ChevronRight size={16} />}
                          {actionLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
