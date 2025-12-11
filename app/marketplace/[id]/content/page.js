import DashboardLayout from '@/components/DashboardLayout'
import { courses } from '../../data'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  CheckCircle2,
  BookOpen,
  FolderOpen,
  Target,
  ListChecks,
  FileText,
  Trophy
} from 'lucide-react'

export default async function CourseContentPage({ params }) {
  const { id } = await params
  const courseId = id

  if (!courseId) {
    return notFound()
  }

  const course = courses.find((c) => String(c.id) === String(courseId))

  if (!course) {
    return notFound()
  }

  const content = course.content || {}

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link
                href={`/marketplace/${course.id}`}
                className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to course
              </Link>
              <span>•</span>
              <span className="capitalize">Internal content</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded">Full Access</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Content Ready</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-700 text-lg">{content.longDescription || course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                    <span className="text-gray-500 font-normal">
                      ({course.reviews.toLocaleString()} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} learners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Access status</div>
                    <div className="text-2xl font-bold text-gray-900">Available after purchase</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/marketplace/${course.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    View course page
                  </Link>
                  <a
                    href="#projects"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <ListChecks className="w-4 h-4" />
                    Jump to projects
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Overview & outcomes</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-gray-700">
                <p>{content.longDescription || course.description}</p>
                {content.certification && (
                  <div className="text-sm text-gray-600">{content.certification}</div>
                )}
              </div>
              <div className="space-y-2">
                {(content.skills || course.outcomes || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Prerequisites</h3>
              </div>
              <div className="space-y-2">
                {(content.prerequisites || ['Basic internet access']).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">What you will get</h3>
              </div>
              <div className="space-y-2">
                {(course.includes || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="projects" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Projects you will build</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(content.projects || []).map((project, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-3">
                  <div className="text-sm text-gray-500">Capstone {idx + 1}</div>
                  <div className="text-lg font-semibold text-gray-900">{project.title}</div>
                  <p className="text-gray-700 text-sm">{project.summary}</p>
                  {project.deliverables && (
                    <div className="space-y-1">
                      {project.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(content.projects || []).length === 0 && (
                <div className="text-gray-600">Project list will be published soon.</div>
              )}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Chapters & lessons</h3>
              </div>
              <div className="text-sm text-gray-600">Total duration: {course.duration}</div>
            </div>
            <div className="space-y-4">
              {course.chapters?.map((chapter, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{chapter.title}</div>
                    <span className="text-sm text-gray-600">{chapter.duration}</span>
                  </div>
                  <div className="space-y-2">
                    {chapter.lessons?.map((lesson, lIdx) => (
                      <div
                        key={lIdx}
                        className="flex items-center justify-between text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200"
                      >
                        <span>{lesson.title}</span>
                        <span className="text-gray-500">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Resources</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {(content.resources || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
              {(content.resources || []).length === 0 && (
                <div className="text-gray-600">Resources will be available upon enrollment.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
