'use client'

import { useState, useEffect } from 'react'
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
  Eye,
  ExternalLink,
  Loader
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

export default function FeedsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get unique categories from articles
  const getUniqueCategories = () => {
    const categoriesSet = new Set()
    articles.forEach(article => {
      if (article.category) {
        categoriesSet.add(article.category)
      }
    })
    return Array.from(categoriesSet).sort()
  }

  const uniqueCategories = getUniqueCategories()

  const categoryIcons = {
    'Trending': TrendingUp,
    'Technology': Code,
    'AI & ML': Sparkles,
    'Education': BookOpen,
    'Careers': Briefcase,
    'News': Newspaper,
    'Business': Briefcase,
    'Science': Award,
  }

  const categories = [
    { id: 'all', name: 'All', icon: Globe, count: articles.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      name: cat,
      icon: categoryIcons[cat] || Zap,
      count: articles.filter(a => a.category === cat).length
    }))
  ]

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('https://spider-bay-six.vercel.app/api/articles')
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        
        const data = await response.json()
        console.log('API Response:', data)
        // API returns data.data.articles
        const articlesList = data.data?.articles || data.articles || []
        console.log('Fetched articles:', articlesList)
        setArticles(articlesList)
      } catch (err) {
        console.error('Error fetching articles:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Recently'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Helper function to generate avatar from author name
  const getAuthorAvatar = (author, index) => {
    if (!author) return `https://ui-avatars.com/api/?name=Anonymous&background=random`
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random`
  }

  // Generate random engagement stats
  const generateStats = (index) => ({
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 300) + 10,
    shares: Math.floor(Math.random() * 1000) + 20
  })

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

  // Map API articles to feed items format
  const feedItems = articles.map((article, index) => {
    const category = article.category || 'Trending'
    return {
      id: article.url, // Use URL as unique ID
      type: 'news',
      category: category, // Keep original case
      title: article.title,
      excerpt: article.description || '',
      source: article.source,
      author: article.author || 'Anonymous',
      authorAvatar: getAuthorAvatar(article.author, index),
      image: article.thumbnail,
      time: getRelativeTime(article.published_date),
      ...generateStats(index),
      tags: article.tags || [],
      trending: category === 'Trending',
      url: article.url
    }
  })

  const filteredFeedItems = feedItems.filter(item => {
    const matchesTab = activeTab === 'all' || 
      item.category === activeTab || 
      (activeTab === 'Trending' && item.trending)
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  // Get trending topics from article tags
  const getTrendingTopics = () => {
    const tagCount = {}
    
    // Count all tags from articles
    articles.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCount)
      .map(([name, count]) => ({
        name,
        count: `${count} article${count !== 1 ? 's' : ''}`,
        trend: `+${Math.floor(Math.random() * 200 + 50)}%` // Random trend for visual effect
      }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count))
      .slice(0, 5)

    return sortedTags
  }

  const trendingTopics = getTrendingTopics()

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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feeds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Clear search"
                >
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = activeTab === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
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
              {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Loader className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-600">Loading latest articles...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-2xl">⚠️</span>
                  </div>
                  <p className="text-gray-900 font-semibold mb-2">Failed to load articles</p>
                  <p className="text-gray-600 text-sm mb-4">{error}</p>
                  <p className="text-gray-600 text-sm mb-4 text-red-500 font-bold">Restart the Feeds Server</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : (
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
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}

                        {/* Post Content */}
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-gray-700 cursor-pointer">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {item.excerpt}
                          </p>

                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.tags.slice(0, 5).map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Post Stats */}
                          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                            <a 
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Read article</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Load More */}
              {!loading && !error && filteredFeedItems.length > 0 && (
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

              {/* Quick Stats removed per request */}

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
