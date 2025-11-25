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
      <div className="p-8">
        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-8">My Curriculum</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const Icon = course.icon
            const progress = getCourseProgress(course.id, course.chapters)
            const actionLabel = progress === 0 ? 'Start' : 'Continue'
            const handleReset = async () => {
              if (!user) return
              
              try {
                // Delete course progress
                await supabase
                  .from('course_progress')
                  .delete()
                  .eq('user_id', user.id)
                  .eq('course_id', course.id)

                // Update local state
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
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${course.color} rounded-xl flex items-center justify-center border-2 ${course.borderColor}`}>
                    <Icon className={course.iconColor} size={28} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    onClick={() => router.push(`/curriculum/${course.id}`)}
                  >
                    {actionLabel}
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">Progress: {progress}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
