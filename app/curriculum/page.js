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

  const demoCourses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      category: 'web',
      instructor: 'Dr. Angela Yu',
      rating: 4.8,
      students: 125000,
      duration: '52 hours',
      lessons: 85,
      level: 'Beginner',
      progress: 45,
      icon: Code,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      enrolled: true
    }
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
    })),
    ...demoCourses
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
            return (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${course.color} rounded-xl flex items-center justify-center border-2 ${course.borderColor}`}>
                    <Icon className={course.iconColor} size={28} />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Enrolled
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
