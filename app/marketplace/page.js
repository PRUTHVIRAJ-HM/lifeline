'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
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

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [likedCourses, setLikedCourses] = useState(new Set())

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'data', name: 'Data Science', icon: Database },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'business', name: 'Business', icon: TrendingUp },
  ]

  const courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp 2025',
      instructor: 'Dr. Angela Yu',
      category: 'programming',
      price: 3499,
      originalPrice: 8999,
      rating: 4.8,
      reviews: 245000,
      students: 890000,
      duration: '65 hours',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      bestseller: true,
      updated: 'Dec 2024',
      features: ['65 hours video', '140 downloadable resources', 'Certificate', 'Lifetime access'],
      description: 'Master full-stack web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB'
    },
    {
      id: 2,
      title: 'Machine Learning A-Z: Python & R in Data Science',
      instructor: 'Kirill Eremenko',
      category: 'ai',
      price: 3999,
      originalPrice: 9999,
      rating: 4.9,
      reviews: 156000,
      students: 620000,
      duration: '44 hours',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      bestseller: true,
      updated: 'Nov 2024',
      features: ['44 hours video', '50+ algorithms', 'Real projects', 'Certificate'],
      description: 'Learn to create Machine Learning algorithms from scratch in Python and R'
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass: Complete Design System',
      instructor: 'Brad Hussey',
      category: 'design',
      price: 2999,
      originalPrice: 7999,
      rating: 4.7,
      reviews: 89000,
      students: 340000,
      duration: '38 hours',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      bestseller: false,
      updated: 'Oct 2024',
      features: ['38 hours video', 'Design projects', 'Figma templates', 'Portfolio ready'],
      description: 'Master UI/UX design from scratch with Figma, Adobe XD, and real-world projects'
    },
    {
      id: 4,
      title: 'Data Science & Analytics Career Path',
      instructor: 'Jose Portilla',
      category: 'data',
      price: 4499,
      originalPrice: 10999,
      rating: 4.8,
      reviews: 178000,
      students: 520000,
      duration: '80 hours',
      level: 'All Levels',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      bestseller: true,
      updated: 'Dec 2024',
      features: ['80 hours video', 'Python & SQL', '15 projects', 'Job ready'],
      description: 'Complete data science bootcamp covering Python, SQL, Tableau, and Machine Learning'
    },
    {
      id: 5,
      title: 'Full Stack JavaScript with MERN Stack',
      instructor: 'Maximilian Schwarzmüller',
      category: 'programming',
      price: 3299,
      originalPrice: 8499,
      rating: 4.7,
      reviews: 123000,
      students: 410000,
      duration: '52 hours',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      bestseller: false,
      updated: 'Nov 2024',
      features: ['52 hours video', 'MERN projects', 'Deploy apps', 'Certificate'],
      description: 'Build full-stack applications with MongoDB, Express, React, and Node.js'
    },
    {
      id: 6,
      title: 'Digital Marketing & Social Media Strategy',
      instructor: 'Phil Ebiner',
      category: 'business',
      price: 2799,
      originalPrice: 6999,
      rating: 4.9,
      reviews: 95000,
      students: 280000,
      duration: '42 hours',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      bestseller: false,
      updated: 'Oct 2024',
      features: ['42 hours video', 'SEO & SEM', 'Social media', 'Analytics'],
      description: 'Master digital marketing, SEO, social media marketing, and content strategy'
    },
    {
      id: 7,
      title: 'Advanced React & Redux Complete Guide',
      instructor: 'Stephen Grider',
      category: 'programming',
      price: 3699,
      originalPrice: 8999,
      rating: 4.9,
      reviews: 142000,
      students: 380000,
      duration: '48 hours',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      bestseller: true,
      updated: 'Dec 2024',
      features: ['48 hours video', 'Advanced patterns', 'Redux toolkit', 'Testing'],
      description: 'Deep dive into React hooks, Redux, Context API, and modern React patterns'
    },
    {
      id: 8,
      title: 'Graphic Design Bootcamp: Photoshop, Illustrator',
      instructor: 'Lindsay Marsh',
      category: 'design',
      price: 2499,
      originalPrice: 6499,
      rating: 4.7,
      reviews: 76000,
      students: 210000,
      duration: '35 hours',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800',
      bestseller: false,
      updated: 'Sep 2024',
      features: ['35 hours video', 'Adobe Suite', '20+ projects', 'Portfolio'],
      description: 'Learn professional graphic design with Adobe Photoshop and Illustrator'
    },
  ]

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
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      Enroll
                    </button>
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
