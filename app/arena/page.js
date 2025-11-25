"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Sparkles,
  Brain,
  Rocket,
  Target,
  X,
  FileText,
  Play,
  Award,
  CheckCircle2,
  Zap,
  Clock,
  BookOpen,
  Trash2,
  UserPlus,
  AlertCircle,
  Eye
} from 'lucide-react'

export default function ArenaPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAIModal, setShowAIModal] = useState(false)
  const [generatedCourses, setGeneratedCourses] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [notification, setNotification] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [expandedChapter, setExpandedChapter] = useState(null)
  const router = useRouter()
  const supabase = createClient()
  
  const [aiCourseData, setAiCourseData] = useState({
    topic: '',
    level: 'beginner',
    duration: '8 hours',
    goals: '',
    chapters: 2,
    contentType: 'mixed'
  })
  
  // Load user and courses from Supabase
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load arena courses (source = 'arena')
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'arena')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading courses:', error)
      } else {
        setGeneratedCourses(courses || [])
        // Get enrolled course IDs from curriculum
        const { data: enrolled } = await supabase
          .from('courses')
          .select('id')
          .eq('user_id', user.id)
          .eq('source', 'curriculum')
        
        if (enrolled) {
          setEnrolledCourses(enrolled.map(c => c.id))
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleEnrollCourse = async (course) => {
    if (!user) return

    // Check if already enrolled
    if (enrolledCourses.includes(course.id)) {
      showNotification('You are already enrolled in this course!', 'warning')
      return
    }
    
    try {
      // Create a copy of the course in curriculum (source = 'curriculum')
      const { error } = await supabase
        .from('courses')
        .insert({
          id: course.id,
          user_id: user.id,
          title: course.title,
          description: course.description,
          topic: course.topic,
          level: course.level,
          duration: course.duration,
          goals: course.goals,
          content_type: course.content_type || course.contentType,
          chapters: course.chapters,
          source: 'curriculum',
          enrolled_at: new Date().toISOString()
        })

      if (error) throw error

      setEnrolledCourses(prev => [...prev, course.id])
      showNotification('Course enrolled successfully! Check your Curriculum page.', 'success')
    } catch (error) {
      console.error('Error enrolling course:', error)
      showNotification('Failed to enroll course. Please try again.', 'error')
    }
  }

  const handleDeleteCourse = (courseId) => {
    setDeleteConfirm(courseId)
  }

  const confirmDelete = async () => {
    if (!user || !deleteConfirm) return

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deleteConfirm)
        .eq('user_id', user.id)

      if (error) throw error

      // Also delete course progress
      await supabase
        .from('course_progress')
        .delete()
        .eq('course_id', deleteConfirm)
        .eq('user_id', user.id)

      // Also delete related assignments
      await supabase
        .from('assignments')
        .delete()
        .eq('course_id', deleteConfirm)
        .eq('user_id', user.id)

      setGeneratedCourses(prev => prev.filter(course => course.id !== deleteConfirm))
      setEnrolledCourses(prev => prev.filter(id => id !== deleteConfirm))
      setDeleteConfirm(null)
      showNotification('Course deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting course:', error)
      showNotification('Failed to delete course. Please try again.', 'error')
    }
  }

  const handleGenerateAICourse = async () => {
    setIsGenerating(true)

    try {
      // Prepare the prompt for course generation
      const numChapters = aiCourseData.chapters

      const systemPrompt = `You are an expert course creator AI. Generate a detailed, structured course curriculum based on the user's requirements. Return ONLY a valid JSON object with no additional text or markdown formatting.`

      const userPrompt = `Create a comprehensive course curriculum with the following specifications:

Topic: ${aiCourseData.topic}
Skill Level: ${aiCourseData.level}
Duration: ${aiCourseData.duration}
Number of Chapters: ${numChapters}
Content Type: ${aiCourseData.contentType}
Learning Goals: ${aiCourseData.goals || 'General mastery of the topic'}

Generate a JSON object with this exact structure:
{
  "courseTitle": "A compelling course title",
  "description": "A detailed 2-3 sentence course description",
  "chapters": [
    {
      "id": 1,
      "title": "Chapter title",
      "description": "Detailed description of what this chapter covers (2-3 sentences)",
      "outline": ["point1", "point2", "point3"],
      "duration": "estimated time to complete",
      "lessons": [
        {
          "title": "Lesson title",
          "content": "Detailed lesson content with proper markdown formatting.\\n\\n# Main Heading\\n\\nIntroductory paragraph explaining the topic.\\n\\n## Subheading\\n\\nMore detailed content here.\\n\\n- Bullet point 1\\n- Bullet point 2\\n- Bullet point 3\\n\\n\`\`\`\\ncode example here\\n\`\`\`\\n\\nTip: Important tips should be prefixed with 'Tip:' for special formatting.\\n\\nConclusion paragraph.",
          "duration": "10-15 min"
        }
      ]
    }
  ]
}

IMPORTANT:
- Each chapter must have a clear outline (3-5 bullet points in the 'outline' array)
- Each chapter must have 3-5 lessons
- Each lesson content MUST use markdown formatting with headings (# ## ###), bullet points (-), code blocks (\`\`\`), and tips (Tip:)
- Content should be educational and comprehensive with at least 3-4 paragraphs per lesson
- Make sure the course is tailored to ${aiCourseData.level} level
- Each chapter should build upon the previous one
- Lessons should be unique and not repetitive
- Use proper markdown syntax in the content field for better formatting`

      // Call the Ollama API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { sender: 'user', text: userPrompt }
          ],
          systemPrompt: systemPrompt
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate course')
      }

      // Read the streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value, { stream: true })
      }

      // Parse the AI response
      let courseData
      try {
        // Try to extract JSON from the response
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          courseData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        // Fallback to basic structure
        courseData = {
          courseTitle: aiCourseData.topic,
          description: `A comprehensive ${aiCourseData.level} level course on ${aiCourseData.topic}`,
          chapters: Array.from({ length: numChapters }, (_, i) => ({
            id: i + 1,
            title: `Chapter ${i + 1}: Introduction to ${aiCourseData.topic}`,
            description: 'Course content generated by AI',
            outline: [
              'Overview of key concepts',
              'Important techniques',
              'Practical examples'
            ],
            duration: '1-2 hours',
            lessons: Array.from({ length: 3 }, (_, j) => ({
              title: `Lesson ${j + 1}`,
              content: 'This lesson covers the fundamentals and basic concepts you need to know.\n\nMore details and examples provided.\n\nSummary and key takeaways.',
              duration: '15 min'
            }))
          }))
        }
      }

      // Fetch YouTube videos for lessons if content type is video or mixed
      let enrichedChapters = courseData.chapters

      if (aiCourseData.contentType === 'video' || aiCourseData.contentType === 'mixed') {
        showNotification('Fetching relevant videos...', 'info')

        enrichedChapters = await Promise.all(
          courseData.chapters.map(async (chapter) => {
            if (!chapter.lessons || chapter.lessons.length === 0) {
              return chapter
            }

            const enrichedLessons = await Promise.all(
              chapter.lessons.map(async (lesson) => {
                try {
                  const searchQuery = `${aiCourseData.topic} ${chapter.title} ${lesson.title} tutorial ${aiCourseData.level}`
                  const ytResponse = await fetch('/api/youtube', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQuery, maxResults: 1 })
                  })

                  if (ytResponse.ok) {
                    const { videos } = await ytResponse.json()
                    if (videos && videos.length > 0) {
                      return {
                        ...lesson,
                        videoUrl: videos[0].url,
                        videoTitle: videos[0].title,
                        videoThumbnail: videos[0].thumbnail,
                        videoChannel: videos[0].channelTitle
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error fetching video for lesson:', error)
                }
                return lesson
              })
            )

            return {
              ...chapter,
              lessons: enrichedLessons
            }
          })
        )
      }

      if (!user) {
        showNotification('Please log in to generate courses', 'error')
        return
      }

      const courseId = Date.now().toString()
      const newCourse = {
        id: courseId,
        user_id: user.id,
        title: courseData.courseTitle || aiCourseData.topic,
        description: courseData.description,
        topic: aiCourseData.topic,
        level: aiCourseData.level,
        duration: aiCourseData.duration,
        goals: aiCourseData.goals,
        content_type: aiCourseData.contentType,
        chapters: enrichedChapters || [],
        source: 'arena'
      }

      // Save to Supabase
      const { error } = await supabase
        .from('courses')
        .insert(newCourse)

      if (error) throw error

      setGeneratedCourses(prev => [newCourse, ...prev])
      setShowAIModal(false)
      showNotification('Course generated successfully with AI!', 'success')

      setAiCourseData({
        topic: '',
        level: 'beginner',
        duration: '8 hours',
        goals: '',
        chapters: 2,
        contentType: 'mixed'
      })
    } catch (error) {
      console.error('Error generating course:', error)
      showNotification('Failed to generate course. Please try again.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getContentTypeLabel = (type) => {
    switch(type) {
      case 'video': return 'Video-based'
      case 'text': return 'Text-based'
      default: return 'Mixed Content'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Get course chapters for preview
  const getCourseChapters = (course) => {
    // If course has AI-generated chapters, use them
    if (course.chapters && Array.isArray(course.chapters) && course.chapters.length > 0) {
      return course.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        details: chapter.description,
        topics: chapter.topics || [],
        duration: chapter.duration
      }))
    }
    
    // Fallback for old courses without AI-generated content
    const numChapters = typeof course.numChapters === 'number' ? course.numChapters : 8
    return Array.from({ length: numChapters }, (_, i) => ({
      id: i + 1,
      title: `Chapter ${i + 1}: ${course.title} - Topic ${i + 1}`,
      details: `Detailed content for chapter ${i + 1} of ${course.title}. This section covers key concepts, exercises, and resources.`,
      topics: [],
      duration: '1-2 hours'
    }))
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F5C832] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F5C832] rounded-full opacity-10 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-8 py-10">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-[#F5C832] text-gray-900 px-4 py-2 rounded-full mb-4 font-bold text-sm">
                <Brain className="w-4 h-4" />
                <span>AI Course Arena</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                Generate Personalized <span className="text-[#F5C832]">Learning Paths with AI</span>
              </h1>
              
              <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto">
                Let our advanced AI create custom courses tailored to your goals and skill level.
              </p>

              <button
                onClick={() => setShowAIModal(true)}
                className="inline-flex items-center space-x-2 bg-[#F5C832] text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create AI Course Now</span>
                <Rocket className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-[#F5C832] mb-0.5">{generatedCourses.length}</div>
                  <div className="text-xs text-gray-300">Courses Created</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-[#F5C832] mb-0.5">100%</div>
                  <div className="text-xs text-gray-300">Personalized</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl font-bold text-[#F5C832] mb-0.5">24/7</div>
                  <div className="text-xs text-gray-300">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">My AI-Generated Courses</h2>
              <p className="text-gray-600">Your personalized learning paths created by AI</p>
            </div>
            {generatedCourses.length > 0 && (
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Another</span>
              </button>
            )}
          </div>

          {generatedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Courses Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your learning journey by generating your first AI-powered course
              </p>
              <button
                onClick={() => setShowAIModal(true)}
                className="inline-flex items-center space-x-2 bg-[#F5C832] text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Your First Course</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C832] rounded-full opacity-10 -translate-y-16 translate-x-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                          {getContentTypeIcon(course.contentType)}
                          <span>{getContentTypeLabel(course.contentType)}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-[#F5C832] text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.numChapters || course.chapters?.length || 0} chapters</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      {enrolledCourses.includes(course.id) && (
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Enrolled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Level</span>
                        <span className="font-semibold text-gray-900 capitalize">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created</span>
                        <span className="font-semibold text-gray-900">{course.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <span className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#F5C832] h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>

                    {course.goals && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Learning Goals:</div>
                        <p className="text-sm text-gray-600">{course.goals}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEnrollCourse(course)}
                        disabled={enrolledCourses.includes(course.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                          enrolledCourses.includes(course.id)
                            ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {enrolledCourses.includes(course.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Enrolled</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Enroll Now</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => setPreviewCourse(course)}
                          className="flex-1 px-6 py-3 border-2 border-blue-500 rounded-lg bg-blue-50 text-blue-900 font-bold flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-100 hover:border-blue-600 transition-all group"
                          title="Preview course"
                        >
                          <Eye className="w-6 h-6 text-blue-700 group-hover:text-blue-900" />
                          <span className="ml-3 text-base font-semibold">Preview</span>
                        </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors group"
                        title="Delete course"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#F5C832] rounded-lg">
                    <Sparkles className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Generate AI Course</h2>
                    <p className="text-sm text-gray-600">Let AI create a personalized course for you</p>
                  </div>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">What do you want to learn? *</label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Python Programming, Digital Marketing..."
                    value={aiCourseData.topic}
                    onChange={(e) => setAiCourseData({...aiCourseData, topic: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Skill Level *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setAiCourseData({...aiCourseData, level})}
                        className={`px-4 py-3 rounded-lg border-2 font-medium capitalize ${
                          aiCourseData.level === level
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Duration</label>
                  <select
                    value={aiCourseData.duration}
                    onChange={(e) => setAiCourseData({...aiCourseData, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="4 hours">4 hours</option>
                    <option value="8 hours">8 hours</option>
                    <option value="12 hours">12 hours</option>
                    <option value="16 hours">16 hours</option>
                    <option value="20 hours">20 hours</option>
                    <option value="self-paced">Self-paced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Number of Chapters</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setAiCourseData({...aiCourseData, chapters: num})}
                        className={`px-4 py-3 rounded-lg border-2 font-medium ${
                          aiCourseData.chapters === num
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Content Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setAiCourseData({...aiCourseData, contentType: 'video'})}
                      className={`flex flex-col items-center space-y-2 px-4 py-4 rounded-lg border-2 ${
                        aiCourseData.contentType === 'video'
                          ? 'border-[#F5C832] bg-yellow-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Play className="w-6 h-6" />
                      <div className="text-sm font-bold">Video</div>
                    </button>
                    <button
                      onClick={() => setAiCourseData({...aiCourseData, contentType: 'text'})}
                      className={`flex flex-col items-center space-y-2 px-4 py-4 rounded-lg border-2 ${
                        aiCourseData.contentType === 'text'
                          ? 'border-[#F5C832] bg-yellow-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                      <div className="text-sm font-bold">Text</div>
                    </button>
                    <button
                      onClick={() => setAiCourseData({...aiCourseData, contentType: 'mixed'})}
                      className={`flex flex-col items-center space-y-2 px-4 py-4 rounded-lg border-2 ${
                        aiCourseData.contentType === 'mixed'
                          ? 'border-[#F5C832] bg-yellow-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Sparkles className="w-6 h-6" />
                      <div className="text-sm font-bold">Mixed</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Learning Goals</label>
                  <textarea
                    placeholder="What do you want to achieve?"
                    value={aiCourseData.goals}
                    onChange={(e) => setAiCourseData({...aiCourseData, goals: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="w-5 h-5 text-[#F5C832]" />
                    <h4 className="font-bold text-lg">Premium Perks Included</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Lifetime Access</div>
                        <div className="text-xs text-gray-300">Learn at your pace</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">AI Study Buddy</div>
                        <div className="text-xs text-gray-300">24/7 assistance</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Progress Tracking</div>
                        <div className="text-xs text-gray-300">Visual analytics</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Downloadable</div>
                        <div className="text-xs text-gray-300">Offline learning</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Certification</div>
                        <div className="text-xs text-gray-300">Shareable credential</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Mobile App</div>
                        <div className="text-xs text-gray-300">Learn anywhere</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-[#F5C832] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">AI-Powered Course Creation</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <span className="text-[#F5C832] mt-1">•</span>
                          <span>Personalized curriculum based on your goals</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#F5C832] mt-1">•</span>
                          <span>Curated materials from top resources</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#F5C832] mt-1">•</span>
                          <span>Adaptive learning path</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#F5C832] mt-1">•</span>
                          <span>24/7 AI mentor support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAICourse}
                  disabled={!aiCourseData.topic || isGenerating}
                  className="flex items-center space-x-2 px-8 py-3 bg-[#F5C832] text-gray-900 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      <span>Generate My Course</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
            <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-xl border-2 backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-900' 
                : notification.type === 'warning'
                ? 'bg-yellow-50 border-yellow-500 text-yellow-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}>
              {notification.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              {notification.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
              {notification.type === 'error' && <X className="w-6 h-6 text-red-600" />}
              <span className="font-medium">{notification.message}</span>
              <button 
                onClick={() => setNotification(null)}
                className="ml-2 hover:opacity-70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Delete Course</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-lg mb-6">
                  Are you sure you want to delete this course? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewCourse && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl my-8">
              {/* Header with Thumbnail Background */}
              <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                <img 
                  src={`https://source.unsplash.com/800x300/?${encodeURIComponent(previewCourse.title)},course,learning,education`} 
                  alt="Course Thumbnail" 
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button 
                  onClick={() => { setPreviewCourse(null); setExpandedChapter(null); }} 
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-[#F5C832] text-gray-900 text-xs font-bold px-2 py-1 rounded">New</span>
                    <span className="text-yellow-400 text-sm font-bold">★ 4.9</span>
                    <span className="text-white/80 text-sm">(32 ratings)</span>
                    <span className="text-white/80 text-sm">• 179 students</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{previewCourse.title}</h2>
                  {previewCourse.description && (
                    <p className="text-white/90 text-sm">{previewCourse.description}</p>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* What you'll learn section */}
                {previewCourse.goals && (
                  <div className="mb-6 p-6 border-2 border-gray-200 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What you'll learn</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {previewCourse.goals.split(',').map((goal, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{goal.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Content */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Course content</h3>
                    <button 
                      onClick={() => setExpandedChapter(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Collapse all sections
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    {getCourseChapters(previewCourse).length} sections • {getCourseChapters(previewCourse).reduce((acc, ch) => acc + (ch.topics?.length || 3), 0)} lectures • {previewCourse.duration} total length
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {getCourseChapters(previewCourse).map((chapter, index) => (
                      <div key={chapter.id} className="border-b border-gray-200 last:border-b-0">
                        <button
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                          onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <svg 
                              className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${expandedChapter === chapter.id ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span className="font-semibold text-gray-900">{chapter.title}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{chapter.topics?.length || 3} lectures</span>
                            <span>• {chapter.duration || '1hr'}</span>
                          </div>
                        </button>
                        
                        {expandedChapter === chapter.id && (
                          <div className="bg-white">
                            {chapter.topics && chapter.topics.length > 0 ? (
                              chapter.topics.map((topic, idx) => (
                                <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-t border-gray-100">
                                  <div className="flex items-center space-x-3">
                                    <Play className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">{topic}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Preview</button>
                                    <span className="text-xs text-gray-500">05:32</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 border-t border-gray-100">
                                <p className="text-sm text-gray-600">{chapter.details}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated {previewCourse.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="capitalize">{previewCourse.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{previewCourse.contentType === 'video' ? 'Video-based' : previewCourse.contentType === 'text' ? 'Text-based' : 'Mixed Content'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
