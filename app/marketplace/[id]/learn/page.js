'use client'

import { useState, useEffect, use } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { courses } from '../../data'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CourseLearnPage({ params }) {
  const router = useRouter()
  const { id } = use(params)
  const courseId = id
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(new Set())

  const course = courses.find((c) => String(c.id) === String(courseId))

  useEffect(() => {
    checkEnrollment()
  }, [courseId])

  const checkEnrollment = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (error || !data) {
        alert('You need to purchase this course first')
        router.push(`/marketplace/${courseId}`)
        return
      }

      setEnrolled(true)
      
      // Set first lesson as default
      if (course?.chapters?.[0]?.lessons?.[0]) {
        setCurrentLesson({
          chapterIndex: 0,
          lessonIndex: 0,
          lesson: course.chapters[0].lessons[0]
        })
      }
    } catch (error) {
      console.error('Enrollment check error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!courseId || !course) {
    return notFound()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading course...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!enrolled) {
    return null // Will redirect
  }

  const handleLessonSelect = (chapterIndex, lessonIndex) => {
    const lesson = course.chapters[chapterIndex].lessons[lessonIndex]
    setCurrentLesson({ chapterIndex, lessonIndex, lesson })
  }

  const markComplete = () => {
    if (currentLesson) {
      const key = `${currentLesson.chapterIndex}-${currentLesson.lessonIndex}`
      setCompletedLessons(prev => new Set([...prev, key]))
    }
  }

  const goToNext = () => {
    if (!currentLesson) return

    const { chapterIndex, lessonIndex } = currentLesson
    const currentChapter = course.chapters[chapterIndex]

    // Try next lesson in current chapter
    if (lessonIndex < currentChapter.lessons.length - 1) {
      handleLessonSelect(chapterIndex, lessonIndex + 1)
      return
    }

    // Try first lesson of next chapter
    if (chapterIndex < course.chapters.length - 1) {
      handleLessonSelect(chapterIndex + 1, 0)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link
              href={`/marketplace/${courseId}`}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to course</span>
            </Link>
            <div className="text-white font-semibold truncate max-w-md">{course.title}</div>
          </div>
        </div>

        <div className="flex">
          {/* Video Player */}
          <div className="flex-1 bg-black">
            {currentLesson?.lesson?.videoId ? (
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${currentLesson.lesson.videoId}?autoplay=0&rel=0`}
                  title={currentLesson.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[56.25vw] bg-gray-900 text-gray-400">
                <PlayCircle className="w-16 h-16" />
              </div>
            )}

            <div className="bg-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentLesson?.lesson?.title || 'Select a lesson'}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentLesson?.lesson?.duration || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={markComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Mark as complete
                </button>
                <button
                  onClick={goToNext}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  Next lesson
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 57px)' }}>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-white font-semibold mb-1">
                <BookOpen className="w-5 h-5" />
                <span>Course content</span>
              </div>
              <div className="text-sm text-gray-400">
                {course.chapters?.length || 0} chapters • {course.duration}
              </div>
            </div>

            <div className="divide-y divide-gray-700">
              {course.chapters?.map((chapter, chIdx) => (
                <div key={chIdx} className="p-4">
                  <div className="text-white font-semibold mb-3 text-sm">{chapter.title}</div>
                  <div className="space-y-2">
                    {chapter.lessons?.map((lesson, lIdx) => {
                      const isActive =
                        currentLesson?.chapterIndex === chIdx && currentLesson?.lessonIndex === lIdx
                      const isCompleted = completedLessons.has(`${chIdx}-${lIdx}`)
                      
                      return (
                        <button
                          key={lIdx}
                          onClick={() => handleLessonSelect(chIdx, lIdx)}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                            isActive
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-300 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : lesson.videoId ? (
                              <PlayCircle className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{lesson.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{lesson.duration}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
