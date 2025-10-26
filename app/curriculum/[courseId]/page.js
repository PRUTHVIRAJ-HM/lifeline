'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  BookOpen,
  Clock,
  Award,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  Lock,
  Video,
  FileText,
  ArrowLeft,
  Download,
  Share2,
  X
} from 'lucide-react'

export default function CourseDetailPage() {
  // Helper to render the read modal
  const renderReadModal = () => {
    if (!readModal.open || !course || !course.chapters) return null
    const chapter = course.chapters[readModal.chapterIndex]
    const lesson = chapter.lessons[readModal.lessonIndex]
    const totalChapters = course.chapters.length;
    const currentChapter = course.chapters[readModal.chapterIndex];
    const totalLessons = currentChapter.lessons.length;

    const handlePrevLesson = () => {
      if (readModal.lessonIndex > 0) {
        setReadModal({ open: true, chapterIndex: readModal.chapterIndex, lessonIndex: readModal.lessonIndex - 1 });
      } else if (readModal.chapterIndex > 0) {
        const prevChapter = course.chapters[readModal.chapterIndex - 1];
        setReadModal({ open: true, chapterIndex: readModal.chapterIndex - 1, lessonIndex: prevChapter.lessons.length - 1 });
      }
    };

    const handleNextLesson = () => {
      if (readModal.lessonIndex < totalLessons - 1) {
        setReadModal({ open: true, chapterIndex: readModal.chapterIndex, lessonIndex: readModal.lessonIndex + 1 });
      } else if (readModal.chapterIndex < totalChapters - 1) {
        setReadModal({ open: true, chapterIndex: readModal.chapterIndex + 1, lessonIndex: 0 });
      }
    };
    const isFirstLesson = readModal.chapterIndex === 0 && readModal.lessonIndex === 0;
    const isLastLesson = readModal.chapterIndex === totalChapters - 1 && readModal.lessonIndex === totalLessons - 1;
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-auto">
        <div className="flex justify-end p-6">
          <button
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"
            onClick={() => setReadModal({ open: false, chapterIndex: null, lessonIndex: null })}
            title="Close"
          >
            <X size={28} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
          <div className="max-w-3xl w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
            <p className="text-base text-gray-500 mb-6">Chapter {readModal.chapterIndex + 1}, Lesson {readModal.lessonIndex + 1}</p>
            <div className="prose max-w-none text-gray-800">
              <h3 className="text-xl font-semibold mb-4">Lesson Content</h3>
              <div className="bg-gray-50 rounded-lg p-8 mb-8 whitespace-pre-line text-lg">
                {lesson.content || lesson.description || 'Content will be available soon.'}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                className={`px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition ${isFirstLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePrevLesson}
                disabled={isFirstLesson}
              >
                Previous Lesson
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition ${isLastLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextLesson}
                disabled={isLastLesson}
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // Modal for reading lesson content
  const [readModal, setReadModal] = useState({ open: false, chapterIndex: null, lessonIndex: null })
  // Remove course from curriculum
  const handleDropout = () => {
    const storedCourses = localStorage.getItem('curriculumCourses')
    if (storedCourses) {
      const courses = JSON.parse(storedCourses)
      const updated = courses.filter(c => c.id !== params.courseId)
      localStorage.setItem('curriculumCourses', JSON.stringify(updated))
      router.push('/curriculum')
    }
  }
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedChapter, setExpandedChapter] = useState(0)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])

  useEffect(() => {
    const loadCourse = () => {
      // Load from localStorage
      const storedCourses = localStorage.getItem('curriculumCourses')
      if (storedCourses) {
        const courses = JSON.parse(storedCourses)
        const foundCourse = courses.find(c => c.id === params.courseId)
        if (foundCourse) {
          setCourse(foundCourse)
          // Set first lesson as current if available
          if (foundCourse.chapters && foundCourse.chapters.length > 0 && 
              foundCourse.chapters[0].lessons && foundCourse.chapters[0].lessons.length > 0) {
            setCurrentLesson({
              chapterIndex: 0,
              lessonIndex: 0,
              lesson: foundCourse.chapters[0].lessons[0]
            })
          }
        }
      }
      setLoading(false)
    }

    loadCourse()

    // Load completed lessons from localStorage
    const completed = localStorage.getItem(`completed_${params.courseId}`)
    if (completed) {
      setCompletedLessons(JSON.parse(completed))
    }
  }, [params.courseId])

  const toggleChapter = (index) => {
    setExpandedChapter(expandedChapter === index ? null : index)
  }

  const selectLesson = (chapterIndex, lessonIndex, lesson) => {
    setCurrentLesson({ chapterIndex, lessonIndex, lesson })
    if (course.contentType === 'text') {
      setReadModal({ open: true, chapterIndex, lessonIndex })
    }
  }

  const markLessonComplete = () => {
    if (!currentLesson) return
    
    const lessonId = `${currentLesson.chapterIndex}-${currentLesson.lessonIndex}`
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId]
      setCompletedLessons(updated)
      localStorage.setItem(`completed_${params.courseId}`, JSON.stringify(updated))
    }

    // Check if this is the last lesson of the chapter
    const currentChapter = course.chapters[currentLesson.chapterIndex]
    const isLastLessonOfChapter = currentLesson.lessonIndex === currentChapter.lessons.length - 1
    if (isLastLessonOfChapter) {
      // Create assignment for this chapter
      const assignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const newAssignment = {
        id: Date.now(),
        courseId: course.id,
        courseTitle: course.title,
        chapterIndex: currentLesson.chapterIndex,
        chapterTitle: currentChapter.title,
        description: `Assignment for ${course.title} - Chapter ${currentLesson.chapterIndex + 1}: ${currentChapter.title}`,
        dueDate: '',
        status: 'pending',
        quizzes: [], // Placeholder for quizzes
        submitted: false,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('assignments', JSON.stringify([...assignments, newAssignment]))
    }

    // Move to next lesson
    if (currentLesson.lessonIndex < currentChapter.lessons.length - 1) {
      // Next lesson in same chapter
      selectLesson(
        currentLesson.chapterIndex,
        currentLesson.lessonIndex + 1,
        currentChapter.lessons[currentLesson.lessonIndex + 1]
      )
    } else if (currentLesson.chapterIndex < course.chapters.length - 1) {
      // First lesson of next chapter
      const nextChapter = course.chapters[currentLesson.chapterIndex + 1]
      if (nextChapter.lessons && nextChapter.lessons.length > 0) {
        setExpandedChapter(currentLesson.chapterIndex + 1)
        selectLesson(
          currentLesson.chapterIndex + 1,
          0,
          nextChapter.lessons[0]
        )
      }
    }
  }

  const isLessonCompleted = (chapterIndex, lessonIndex) => {
    return completedLessons.includes(`${chapterIndex}-${lessonIndex}`)
  }

  const calculateProgress = () => {
    if (!course || !course.chapters) return 0
    const totalLessons = course.chapters.reduce((acc, chapter) => 
      acc + (chapter.lessons?.length || 0), 0)
    if (totalLessons === 0) return 0
    return Math.round((completedLessons.length / totalLessons) * 100)
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    
    // Handle different YouTube URL formats
    let videoId = null
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0]
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
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

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <button
            onClick={() => router.push('/curriculum')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Curriculum
          </button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const progress = calculateProgress()

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <button
              onClick={() => router.push('/curriculum')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Curriculum
            </button>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>1,234 students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{course.duration || '8 weeks'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{course.chapters?.length || 0} chapters</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Your Progress</span>
                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-6">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8 flex justify-end">
            <div className="flex gap-2">
              <button
                className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                onClick={handleDropout}
              >
                Dropout
              </button>
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition"
                onClick={() => {
                  localStorage.removeItem(`completed_${params.courseId}`)
                  window.location.reload()
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video/Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {currentLesson ? (
                  <>
                    {/* Video Player or Text Content */}
                    {currentLesson.lesson.videoUrl && course.contentType !== 'text' ? (
                      <div className="aspect-video bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(currentLesson.lesson.videoUrl)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <FileText size={64} className="text-blue-600" />
                      </div>
                    )}

                    {/* Lesson Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {currentLesson.lesson.title}
                          </h2>
                          <p className="text-sm text-gray-600">
                            Chapter {currentLesson.chapterIndex + 1}, Lesson {currentLesson.lessonIndex + 1}
                          </p>
                        </div>
                        
                        {!isLessonCompleted(currentLesson.chapterIndex, currentLesson.lessonIndex) && (
                          <button
                            onClick={markLessonComplete}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Mark Complete
                          </button>
                        )}
                      </div>

                      {/* Lesson Content */}
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold mb-3">What you'll learn:</h3>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {currentLesson.lesson.content || currentLesson.lesson.description || 'Content will be available soon.'}
                          </p>
                        </div>

                        {/* Mixed content: Show both video and text */}
                        {course.contentType === 'mixed' && currentLesson.lesson.videoUrl && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Video Tutorial:</h3>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <iframe
                                src={getYouTubeEmbedUrl(currentLesson.lesson.videoUrl)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}

                        {/* Additional Resources */}
                        {currentLesson.lesson.resources && (
                          <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Download size={20} />
                              Additional Resources
                            </h3>
                            <ul className="space-y-2">
                              {currentLesson.lesson.resources.map((resource, idx) => (
                                <li key={idx}>
                                  <a href="#" className="text-blue-600 hover:underline">
                                    {resource}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Select a lesson to start learning</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Course Content */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 sticky top-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} lessons
                  </p>
                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {course.chapters && course.chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleChapter(chapterIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-600">
                              {chapterIndex + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {chapter.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {chapter.lessons?.length || 0} lessons
                            </p>
                          </div>
                        </div>
                        {expandedChapter === chapterIndex ? (
                          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      {expandedChapter === chapterIndex && chapter.lessons && (
                        <div className="bg-gray-50">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const isCompleted = isLessonCompleted(chapterIndex, lessonIndex)
                            const isCurrent = currentLesson?.chapterIndex === chapterIndex && 
                                            currentLesson?.lessonIndex === lessonIndex

                            return (
                              <button
                                key={lessonIndex}
                                onClick={() => selectLesson(chapterIndex, lessonIndex, lesson)}
                                className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                                  isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle size={20} className="text-green-600" />
                                  ) : lesson.videoUrl && course.contentType !== 'text' ? (
                                    <Video size={20} className="text-gray-400" />
                                  ) : (
                                    <FileText size={20} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className={`text-sm truncate ${
                                    isCurrent ? 'font-semibold text-blue-600' : 'text-gray-700'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  {lesson.duration && (
                                    <p className="text-xs text-gray-500">{lesson.duration}</p>
                                  )}
                                </div>
                                {course.contentType === 'text' && (
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Read</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  {/* Modal for reading lesson content (text-based courses) */}
  {renderReadModal()}
  </DashboardLayout>
  )
}
