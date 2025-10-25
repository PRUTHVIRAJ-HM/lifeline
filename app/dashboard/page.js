'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
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
  Video
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentDate, setCurrentDate] = useState(new Date(2021, 11, 1)) // December 2021
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

  const leaderboard = [
    { rank: 1, name: 'Charlie Rawal', avatar: '👤', courses: 53, hours: 250, points: 13450, trend: 'up' },
    { rank: 2, name: 'Ariana Agarwal', avatar: '👤', courses: 88, hours: 212, points: 10333, trend: 'down' }
  ]

  const todos = [
    { id: 1, title: 'Developing Restaurant Apps', category: 'Programming', time: '08:00 AM', completed: false },
    { id: 2, title: 'Integrate API', category: '', time: '', completed: false },
    { id: 3, title: 'Slicing Home Screen', category: '', time: '', completed: false },
    { id: 4, title: 'Research Objective User', category: 'Product Design', time: '02:40 PM', completed: false },
    { id: 5, title: 'Report Analysis P2P Business', category: 'Business', time: '04:50 PM', completed: true }
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Courses */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {courses.map((course) => {
                  const Icon = course.icon
                  return (
                    <div key={course.id} className={`${course.color} rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
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
                          <Users size={16} />
                          <span>{course.participants}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Hours Spent & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hours Spent */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Hours Spent</h2>
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FF8A65] rounded"></div>
                      <span className="text-sm text-gray-600">Study</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFE0B2] rounded"></div>
                      <span className="text-sm text-gray-600">Exams</span>
                    </div>
                  </div>
                  <div className="relative h-64">
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                      {studyData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1 relative">
                          <div className="w-full flex flex-col items-center gap-1">
                            {data.exams > 0 && (
                              <div 
                                className="w-full bg-[#2C3544] rounded-t-lg relative"
                                style={{ height: `${data.exams * 2}px` }}
                              >
                                {index === 3 && (
                                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#2C3544] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    <div>🔥 55 Hr</div>
                                    <div>📚 32 Hr</div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div 
                              className={`w-full bg-[#FF8A65] ${data.exams === 0 ? 'rounded-t-lg' : ''}`}
                              style={{ height: `${data.study * 2}px` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0 Hr</span>
                    <span>20 Hr</span>
                    <span>40 Hr</span>
                    <span>60 Hr</span>
                    <span>80 Hr</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#4169E1]">
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#4DB6AC] rounded"></div>
                      <span className="text-sm text-gray-600">Point Progress</span>
                    </div>
                  </div>
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Circular Progress */}
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
                        strokeDasharray={`${2 * Math.PI * 80 * 0.75} ${2 * Math.PI * 80}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#FF8A65] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">Your Point:</p>
                    <p className="text-2xl font-bold text-gray-900">8,966</p>
                  </div>
                </div>
              </div>

              {/* Leader Board */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Leader Board</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">RANK</th>
                        <th className="pb-3 font-medium">NAME</th>
                        <th className="pb-3 font-medium">COURSE</th>
                        <th className="pb-3 font-medium">HOUR</th>
                        <th className="pb-3 font-medium">POINT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((leader) => (
                        <tr key={leader.rank} className="border-b last:border-b-0">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{leader.rank}</span>
                              {leader.trend === 'up' ? (
                                <TrendingUp size={16} className="text-green-500" />
                              ) : (
                                <TrendingDown size={16} className="text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                                {leader.avatar}
                              </div>
                              <span className="font-medium">{leader.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600">{leader.courses}</td>
                          <td className="py-4 text-gray-600">{leader.hours}</td>
                          <td className="py-4 text-[#4DB6AC] font-semibold">{leader.points.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="relative inline-block mb-4">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{user?.user_metadata?.full_name || user?.email || 'User'}</h3>
                <p className="text-sm text-gray-500">College Student</p>
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
                  {getDaysInMonth(currentDate).map((day, index) => (
                    <div
                      key={index}
                      className={`text-sm py-2 rounded-lg ${
                        day === 25 
                          ? 'bg-[#4DB6AC] text-white font-semibold' 
                          : day 
                          ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                          : ''
                      }`}
                    >
                      {day || ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* To Do List */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">To Do List</h3>
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-start gap-3">
                      <button className="mt-0.5">
                        {todo.completed ? (
                          <CheckCircle2 size={20} className="text-[#4DB6AC]" />
                        ) : (
                          <Circle size={20} className="text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {todo.title}
                        </p>
                        {todo.category && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{todo.category}</span>
                            {todo.time && (
                              <span className="text-xs text-orange-500">{todo.time}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
