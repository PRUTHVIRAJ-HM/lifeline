'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Newspaper, 
  BookOpen, 
  Briefcase, 
  Code, 
  Sparkles,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Filter,
  Search,
  Globe,
  Zap,
  Award,
  Users,
  Eye
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function FeedsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'tech', name: 'Technology', icon: Code },
    { id: 'education', name: 'Education', icon: BookOpen },
    { id: 'careers', name: 'Careers', icon: Briefcase },
    { id: 'ai', name: 'AI & ML', icon: Sparkles },
  ]

  const feedItems = [
    {
      id: 1,
      type: 'news',
      category: 'ai',
      title: 'OpenAI Releases GPT-5 with Revolutionary Reasoning Capabilities',
      excerpt: 'The latest AI model shows unprecedented abilities in complex problem-solving and multi-step reasoning tasks.',
      source: 'TechCrunch',
      author: 'Sarah Chen',
      authorAvatar: 'https://i.pravatar.cc/150?img=1',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      time: '2 hours ago',
      likes: 1243,
      comments: 89,
      shares: 156,
      tags: ['AI', 'GPT-5', 'OpenAI', 'Machine Learning'],
      trending: true
    },
    {
      id: 2,
      type: 'article',
      category: 'education',
      title: 'Top 10 Skills Every Software Developer Should Learn in 2025',
      excerpt: 'From quantum computing to AI integration, discover the essential skills that will define the future of software development.',
      source: 'Dev.to',
      author: 'Marcus Johnson',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      time: '4 hours ago',
      likes: 892,
      comments: 54,
      shares: 201,
      tags: ['Programming', 'Career', 'Skills'],
      trending: false
    },
    {
      id: 3,
      type: 'news',
      category: 'tech',
      title: 'Microsoft Announces Major Updates to VS Code with AI Co-Pilot',
      excerpt: 'Visual Studio Code gets smarter with integrated AI assistance for code generation, debugging, and optimization.',
      source: 'The Verge',
      author: 'Emma Williams',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      time: '6 hours ago',
      likes: 2156,
      comments: 134,
      shares: 423,
      tags: ['Microsoft', 'VS Code', 'AI', 'Development'],
      trending: true
    },
    {
      id: 4,
      type: 'opportunity',
      category: 'careers',
      title: 'Google Opens Applications for Summer 2025 Internship Program',
      excerpt: 'Apply now for software engineering, ML, and product management roles. Applications close November 15, 2025.',
      source: 'Google Careers',
      author: 'HR Team',
      authorAvatar: 'https://i.pravatar.cc/150?img=20',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
      time: '8 hours ago',
      likes: 3421,
      comments: 267,
      shares: 891,
      tags: ['Internship', 'Google', 'Careers', 'Jobs'],
      trending: true
    },
    {
      id: 5,
      type: 'tutorial',
      category: 'tech',
      title: 'Building Scalable Microservices with Docker and Kubernetes',
      excerpt: 'A comprehensive guide to containerization and orchestration for modern cloud-native applications.',
      source: 'Medium',
      author: 'Alex Kumar',
      authorAvatar: 'https://i.pravatar.cc/150?img=8',
      image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      time: '12 hours ago',
      likes: 567,
      comments: 43,
      shares: 178,
      tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud'],
      trending: false
    },
    {
      id: 6,
      type: 'news',
      category: 'education',
      title: 'Harvard and MIT Launch Free AI Ethics Course for Everyone',
      excerpt: 'Learn about responsible AI development, bias mitigation, and ethical considerations in machine learning.',
      source: 'EdTech News',
      author: 'Dr. Lisa Park',
      authorAvatar: 'https://i.pravatar.cc/150?img=9',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      time: '1 day ago',
      likes: 1876,
      comments: 156,
      shares: 542,
      tags: ['AI Ethics', 'Education', 'Free Course', 'MIT', 'Harvard'],
      trending: false
    },
    {
      id: 7,
      type: 'news',
      category: 'tech',
      title: 'Apple Vision Pro 2 Released with Enhanced AR Capabilities',
      excerpt: 'The next generation of spatial computing brings improved resolution, longer battery life, and new developer tools.',
      source: 'Apple Newsroom',
      author: 'Tim Cook',
      authorAvatar: 'https://i.pravatar.cc/150?img=33',
      image: 'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800',
      time: '1 day ago',
      likes: 4567,
      comments: 342,
      shares: 1234,
      tags: ['Apple', 'AR', 'VR', 'Vision Pro'],
      trending: true
    },
    {
      id: 8,
      type: 'article',
      category: 'careers',
      title: 'Remote Work Statistics 2025: The Future of Work is Here',
      excerpt: '78% of tech companies now offer fully remote positions. Here\'s what it means for job seekers.',
      source: 'Forbes',
      author: 'David Martinez',
      authorAvatar: 'https://i.pravatar.cc/150?img=14',
      image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
      time: '2 days ago',
      likes: 923,
      comments: 78,
      shares: 234,
      tags: ['Remote Work', 'Statistics', 'Career Trends'],
      trending: false
    },
  ]

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const toggleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const filteredFeedItems = feedItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab || (activeTab === 'trending' && item.trending)
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const trendingTopics = [
    { name: 'GPT-5 Launch', count: '15K posts', trend: '+245%' },
    { name: 'Remote Jobs', count: '8.2K posts', trend: '+89%' },
    { name: 'AI Ethics', count: '6.7K posts', trend: '+156%' },
    { name: 'Web3', count: '5.1K posts', trend: '+67%' },
    { name: 'Quantum Computing', count: '3.9K posts', trend: '+123%' },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Feeds</h1>
                <p className="text-sm text-gray-500 mt-1">Stay updated with the latest in tech, education, and careers</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feeds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm w-64"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === category.id
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

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">
            {/* Main Feed */}
            <div className="flex-1">
              <div className="space-y-4">
                {filteredFeedItems.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No feeds found matching your criteria</p>
                  </div>
                ) : (
                  filteredFeedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Post Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.authorAvatar}
                            alt={item.author}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{item.author}</p>
                              {item.trending && (
                                <span className="flex items-center space-x-1 bg-[#F5C832] text-gray-900 text-xs px-2 py-0.5 rounded-full font-medium">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Trending</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{item.source} • {item.time}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Bookmark 
                            className={`w-5 h-5 ${bookmarkedPosts.has(item.id) ? 'fill-[#F5C832] text-[#F5C832]' : 'text-gray-600'}`}
                            onClick={() => toggleBookmark(item.id)}
                          />
                        </button>
                      </div>

                      {/* Post Image */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-64 object-cover"
                      />

                      {/* Post Content */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-gray-700 cursor-pointer">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {item.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => toggleLike(item.id)}
                              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group"
                            >
                              <Heart 
                                className={`w-5 h-5 ${likedPosts.has(item.id) ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500'}`}
                              />
                              <span className="text-sm font-medium">
                                {likedPosts.has(item.id) ? item.likes + 1 : item.likes}
                              </span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{item.comments}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                              <Share2 className="w-5 h-5" />
                              <span className="text-sm font-medium">{item.shares}</span>
                            </button>
                          </div>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>Read more</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More */}
              {filteredFeedItems.length > 0 && (
                <div className="mt-6 text-center">
                  <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    Load More Feeds
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
              {/* Trending Topics */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-[#F5C832]" />
                  <h3 className="font-bold text-gray-900">Trending Topics</h3>
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <button key={index} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-900 group-hover:text-gray-700">
                          {index + 1}. {topic.name}
                        </p>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                          {topic.trend}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{topic.count}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-[#F5C832]" />
                  <h3 className="font-bold">Your Activity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Posts read today</span>
                    <span className="font-bold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Bookmarks</span>
                    <span className="font-bold">{bookmarkedPosts.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Interactions</span>
                    <span className="font-bold">{likedPosts.size + bookmarkedPosts.size}</span>
                  </div>
                </div>
              </div>

              {/* Suggested Topics */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-4">Suggested Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Python', 'Cloud', 'Blockchain', 'IoT', 'Cybersecurity', '5G', 'Edge Computing'].map((topic, index) => (
                    <button
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-[#F5C832] hover:text-gray-900 transition-colors font-medium"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
