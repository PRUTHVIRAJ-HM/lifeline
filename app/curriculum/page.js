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
  // Get course progress from localStorage
  const getCourseProgress = (courseId, chapters) => {
    const completed = localStorage.getItem(`completed_${courseId}`)
    if (!completed || !chapters) return 0
    const completedLessons = JSON.parse(completed)
    const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)
    if (totalLessons === 0) return 0
    return Math.round((completedLessons.length / totalLessons) * 100)
  }
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [arenaCourses, setArenaCourses] = useState([])
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
    
    const storedCurriculum = localStorage.getItem('curriculumCourses')
    if (storedCurriculum) {
      setArenaCourses(JSON.parse(storedCurriculum))
    }
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
        <h1 className="text-3xl font-bold mb-8">My Curriculum</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const Icon = course.icon
            const progress = getCourseProgress(course.id, course.chapters)
            const actionLabel = progress === 0 ? 'Start' : 'Continue'
            const handleReset = () => {
              localStorage.removeItem(`completed_${course.id}`)
              window.location.reload()
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
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Enrolled
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
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
