'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Leaderboard from '@/components/Leaderboard'
import { getUserRank } from '@/lib/scoring'
import { 
  BookOpen,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  Edit,
  Code,
  Palette,
  Video,
  Plus,
  Trash2,
  Trophy,
  Award
} from 'lucide-react'

export default function DashboardPage() {
  const [averageQuizScore, setAverageQuizScore] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentDate, setCurrentDate] = useState(new Date()) // Current date instead of Dec 2021
  const [recentCourses, setRecentCourses] = useState([])
  const [todos, setTodos] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoCategory, setNewTodoCategory] = useState('')
  const [newTodoTime, setNewTodoTime] = useState('')
  const [newTodoDate, setNewTodoDate] = useState('')
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [totalTimeToday, setTotalTimeToday] = useState(0) // Total time today in seconds
  const [weeklySessionData, setWeeklySessionData] = useState([])
  const [userScore, setUserScore] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Calculate average quiz score from completed assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('quiz_result')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('quiz_result', 'is', null)

      if (assignments && assignments.length > 0) {
        const completedWithQuiz = assignments.filter(a => 
          a.quiz_result && 
          typeof a.quiz_result.score === 'number' && 
          typeof a.quiz_result.total === 'number'
        )
        let totalScore = 0
        let totalQuestions = 0
        completedWithQuiz.forEach(a => {
          totalScore += a.quiz_result.score
          totalQuestions += a.quiz_result.total
        })
        if (totalQuestions > 0) {
          setAverageQuizScore(Math.round((totalScore / totalQuestions) * 100))
        } else {
          setAverageQuizScore(null)
        }
      } else {
        setAverageQuizScore(null)
      }

      // Load courses from curriculum
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'curriculum')
        .order('enrolled_at', { ascending: false })
        .limit(3)

      if (courses) {
        setRecentCourses(courses)
      }

      setLoading(false)
    }

    loadData()

    // Load todos from Supabase instead of localStorage
    const loadTodos = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setTodos(data)
      }
    }
    loadTodos()

    // Load today's session time from Supabase
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      supabase
        .from('profiles')
        .select('session_data')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.session_data) {
            // Set today's time
            if (data.session_data[today]) {
              setTotalTimeToday(data.session_data[today])
            }

            // Get last 5 days for graph
            const last5Days = []
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            for (let i = 4; i >= 0; i--) {
              const date = new Date()
              date.setDate(date.getDate() - i)
              const dateStr = date.toISOString().split('T')[0]
              const timeInSeconds = data.session_data[dateStr] || 0
              const hours = Math.round(timeInSeconds / 3600) // Convert to hours
              
              last5Days.push({
                month: monthNames[date.getMonth()],
                day: date.getDate(),
                study: hours,
                exams: 0 // Can be used later for quiz/test time tracking
              })
            }
            
            setWeeklySessionData(last5Days)
          }
        })
    }
  }, [router, supabase])

  // Load session data for Hours Spent graph
  useEffect(() => {
    if (!user) return

    const loadSessionData = async () => {
      const today = new Date()
      const last5Days = []
      
      for (let i = 4; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        last5Days.push(date.toISOString().split('T')[0])
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('session_data')
        .eq('id', user.id)
        .single()

      const sessionData = profileData?.session_data || {}
      const todayTotal = sessionData[last5Days[4]] || 0
      setTotalTimeToday(todayTotal)

      const weekData = last5Days.map((date, index) => ({
        day: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        study: (sessionData[date] || 0) / 3600 // Convert seconds to hours
      }))

      setWeeklySessionData(weekData)
    }

    loadSessionData()
    // Refresh data every minute to show updates
    const refreshInterval = setInterval(loadSessionData, 60000)

    return () => clearInterval(refreshInterval)
  }, [user, supabase])

  // Load user score for leaderboard
  useEffect(() => {
    if (!user) return

    const loadUserScore = async () => {
      const { success, data } = await getUserRank(user.id)
      if (success) {
        setUserScore(data) // data can be null if user has no scores yet
      }
    }

    loadUserScore()
    // Refresh score every 30 seconds
    const scoreInterval = setInterval(loadUserScore, 30000)

    return () => clearInterval(scoreInterval)
  }, [user])

  // Load todos helper reused (needed for realtime & CRUD refresh)
  const reloadTodos = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setTodos(data)
  }

  // Add new todo (persist to Supabase)
  const addTodo = async () => {
    if (!newTodoTitle.trim() || !user) return
    const insertPayload = {
      user_id: user.id,
      title: newTodoTitle.trim(),
      category: newTodoCategory.trim() || null,
      due_date: newTodoDate ? newTodoDate : null
    }
    const { error } = await supabase.from('todos').insert(insertPayload)
    if (error) {
      console.error('Failed to insert todo:', error)
      return
    }
    // Optional: calendar integration kept if date & time provided
    if (newTodoDate && newTodoTime) {
      try {
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: newTodoTitle.trim(),
            description: newTodoCategory.trim() || 'Todo item',
            date: newTodoDate,
            time: newTodoTime
          })
        })
      } catch (error) {
        console.error('Failed to add to calendar:', error)
      }
    }
    setNewTodoTitle('')
    setNewTodoCategory('')
    setNewTodoTime('')
    setNewTodoDate('')
    setShowAddTodo(false)
    reloadTodos()
  }

  // Toggle completion (update is_completed)
  const toggleTodo = async (id, current) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !current, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user?.id)
    if (error) {
      console.error('Failed to toggle todo:', error)
      return
    }
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !current } : t))
  }

  // Delete todo (Supabase row)
  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)
    if (error) {
      console.error('Failed to delete todo:', error)
      return
    }
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  // Realtime subscription for this user's todos
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('todos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user.id}` }, () => {
        reloadTodos()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  // Helper function to get icon based on course type or default
  const getCourseIcon = (course, index) => {
    if (course.type === 'design' || course.title?.toLowerCase().includes('design')) return Palette
    if (course.type === 'programming' || course.title?.toLowerCase().includes('html') || course.title?.toLowerCase().includes('code')) return Code
    if (course.type === 'video' || course.title?.toLowerCase().includes('motion')) return Video
    // Default icons based on index
    return [Code, Palette, Video][index % 3]
  }

  const getCourseColor = (index) => {
    const colors = ['bg-[#E8E7F0]', 'bg-[#FFF4E6]', 'bg-[#E8F5E9]']
    return colors[index % 3]
  }

  const getIconColor = (index) => {
    const colors = ['text-purple-600', 'text-orange-600', 'text-green-600']
    return colors[index % 3]
  }

  const handleCourseClick = (courseId) => {
    router.push(`/curriculum/${courseId}`)
  }

  const courses = [
    {
      id: 1,
      name: 'Basic: HTML and CSS',
      icon: Code,
      color: 'bg-[#E8E7F0]',
      iconColor: 'text-purple-600',
      lessons: 24,
      assignments: 8,
      participants: 99
    },
    {
      id: 2,
      name: 'Branding Design',
      icon: Palette,
      color: 'bg-[#FFF4E6]',
      iconColor: 'text-orange-600',
      lessons: 24,
      assignments: 8,
      participants: 99
    },
    {
      id: 3,
      name: 'Motion Design',
      icon: Video,
      color: 'bg-[#E8F5E9]',
      iconColor: 'text-green-600',
      lessons: 24,
      assignments: 8,
      participants: 99
    }
  ]

  const studyData = [
    { month: 'Jan', study: 35, exams: 0 },
    { month: 'Feb', study: 20, exams: 0 },
    { month: 'Mar', study: 60, exams: 0 },
    { month: 'Apr', study: 35, exams: 20 },
    { month: 'May', study: 15, exams: 0 }
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  // Manual refresh for score/rank
  const refreshUserScore = async () => {
    if (!user) return
    const { success, data } = await getUserRank(user.id)
    if (success) setUserScore(data)
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Courses */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course, index) => {
                    const Icon = getCourseIcon(course, index)
                    const totalLessons = course.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0
                    return (
                      <div 
                        key={course.id} 
                        className={`${getCourseColor(index)} rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="mb-4">
                          <Icon className={`w-8 h-8 ${getIconColor(index)}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-4 line-clamp-2">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen size={16} />
                            <span>{totalLessons}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText size={16} />
                            <span>{course.chapters?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Removed students enrolled */}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  courses.map((course) => {
                    const Icon = course.icon
                    return (
                      <div key={course.id} className={`${course.color} rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-50`}>
                        <div className="mb-4">
                          <Icon className={`w-8 h-8 ${course.iconColor}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-4">{course.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen size={16} />
                            <span>{course.lessons}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText size={16} />
                            <span>{course.assignments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Removed students enrolled */}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Hours Spent & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hours Spent */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Hours Spent</h2>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-sm font-semibold text-[#FF8A65]">{formatTime(totalTimeToday)}</p>
                    </div>
                  </div>
                  <div className="relative h-64">
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                      {(weeklySessionData.length > 0 ? weeklySessionData : [
                        { month: 'Jan', day: 1, study: 0, exams: 0 },
                        { month: 'Jan', day: 2, study: 0, exams: 0 },
                        { month: 'Jan', day: 3, study: 0, exams: 0 },
                        { month: 'Jan', day: 4, study: 0, exams: 0 },
                        { month: 'Jan', day: 5, study: 0, exams: 0 }
                      ]).map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1 relative">
                          <div className="w-full flex flex-col items-center gap-1">
                            {data.exams > 0 && (
                              <div 
                                className="w-full bg-[#FFE0B2] rounded-t-lg"
                                style={{ height: `${Math.max(data.exams * 20, 8)}px` }}
                              ></div>
                            )}
                            <div 
                              className={`w-full bg-[#FF8A65] ${data.exams === 0 ? 'rounded-t-lg' : ''}`}
                              style={{ height: `${Math.max(data.study * 20, data.study > 0 ? 8 : 0)}px` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{data.month} {data.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FF8A65] rounded"></div>
                      <span className="text-sm text-gray-600">Study</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFE0B2] rounded"></div>
                      <span className="text-sm text-gray-600">Exams</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#4DB6AC] rounded"></div>
                      <span className="text-sm text-gray-600">Quiz Score</span>
                    </div>
                  </div>
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Circular Progress - dynamic based on averageQuizScore */}
                    <svg className="transform -rotate-90" width="192" height="192">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#E0E0E0"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#4DB6AC"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 80 * ((averageQuizScore || 0) / 100)} ${2 * Math.PI * 80}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#FF8A65] rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {averageQuizScore !== null ? `${averageQuizScore}%` : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">Average Quiz Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageQuizScore !== null ? `${averageQuizScore}%` : 'No quizzes yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leaderboard - Dynamic */}
              <Leaderboard userId={user?.id} showTop={10} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="relative inline-block mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-semibold">
                      {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{profile?.full_name || user?.email || 'User'}</h3>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <h3 className="font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-xs font-medium text-gray-500">{day}</div>
                  ))}
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const today = new Date()
                    const isToday = day && 
                      currentDate.getMonth() === today.getMonth() && 
                      currentDate.getFullYear() === today.getFullYear() && 
                      day === today.getDate()
                    
                    return (
                      <div
                        key={index}
                        className={`text-sm py-2 rounded-lg ${
                          isToday
                            ? 'bg-[#4DB6AC] text-white font-semibold' 
                            : day 
                            ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                            : ''
                        }`}
                      >
                        {day || ''}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Score Card */}
              {userScore && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-sm border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">Your Score</h3>
                      <Trophy className="w-6 h-6 text-orange-500" />
                    </div>
                    <button
                      onClick={refreshUserScore}
                      className="text-xs px-2 py-1 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium transition"
                      title="Refresh score"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-orange-600 mb-1">{userScore.total_score}</p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-orange-200">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-semibold text-gray-700">Rank #{userScore.effective_rank || userScore.dynamic_rank || userScore.rank || 1}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assignments</span>
                      <span className="font-semibold text-gray-900">{userScore.assignments_completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Perfect Scores</span>
                      <span className="font-semibold text-yellow-600">{userScore.perfect_scores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-semibold text-blue-600">{userScore.current_streak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus Points</span>
                      <span className="font-semibold text-green-600">+{userScore.bonus_points}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* To Do List */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">To Do List</h3>
                  <button
                    onClick={() => setShowAddTodo(!showAddTodo)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Add Todo"
                  >
                    <Plus size={20} className="text-gray-600" />
                  </button>
                </div>

                {showAddTodo && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                    <input
                      type="text"
                      placeholder="What do you need to do?"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g., Study, Work, Personal)"
                      value={newTodoCategory}
                      onChange={(e) => setNewTodoCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Due Date</label>
                        <input
                          type="date"
                          value={newTodoDate}
                          onChange={(e) => setNewTodoDate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Time</label>
                        <input
                          type="time"
                          value={newTodoTime}
                          onChange={(e) => setNewTodoTime(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={addTodo}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-semibold"
                      >
                        Add Todo
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTodo(false)
                          setNewTodoTitle('')
                          setNewTodoCategory('')
                          setNewTodoTime('')
                          setNewTodoDate('')
                        }}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {todos.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No todos yet. Add one to get started!</p>
                  ) : (
                    todos.map((todo) => (
                      <div key={todo.id} className="flex items-start gap-3 group">
                        <button 
                          className="mt-0.5 flex-shrink-0"
                          onClick={() => toggleTodo(todo.id, todo.is_completed)}
                        >
                          {todo.is_completed ? (
                            <CheckCircle2 size={20} className="text-[#4DB6AC]" />
                          ) : (
                            <Circle size={20} className="text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm break-words ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {todo.title}
                          </p>
                          {(todo.category || todo.due_date) && (
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {todo.category && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{todo.category}</span>
                              )}
                              {todo.due_date && (
                                <span className="text-xs text-blue-600">{new Date(todo.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
