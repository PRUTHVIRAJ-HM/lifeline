'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  ClipboardCheck,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Trash2,
  Edit,
  FileText,
  Link as LinkIcon,
  X
} from 'lucide-react'

export default function AssignmentPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [activeQuizAssignment, setActiveQuizAssignment] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    link: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      loadAssignments()
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const loadAssignments = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading assignments:', error)
    } else {
      // Transform data to match existing format
      const transformed = (data || []).map(a => ({
        id: a.id,
        title: a.title,
        course: a.course,
        courseId: a.course_id,
        courseTitle: a.course_title,
        chapterIndex: a.chapter_index,
        chapterTitle: a.chapter_title,
        description: a.description,
        dueDate: a.due_date,
        priority: a.priority,
        status: a.status,
        link: a.link,
        quizzes: a.quizzes || [],
        quizResult: a.quiz_result,
        submitted: a.submitted,
        createdAt: a.created_at
      }))
      setAssignments(transformed)
    }
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
      case 'in-progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
      case 'overdue':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleAddAssignment = async () => {
    if (!formData.title || !formData.course || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    if (!user) return

    try {
      const assignmentData = {
        user_id: user.id,
        title: formData.title,
        course: formData.course,
        description: formData.description,
        due_date: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        link: formData.link
      }

      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingAssignment.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Insert new assignment
        const { error } = await supabase
          .from('assignments')
          .insert(assignmentData)

        if (error) throw error
      }

      await loadAssignments()
      resetForm()
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('Failed to save assignment. Please try again.')
    }
  }

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      course: assignment.course,
      description: assignment.description,
      dueDate: assignment.dueDate,
      priority: assignment.priority,
      status: assignment.status,
      link: assignment.link
    })
    setShowAddModal(true)
  }

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?') || !user) return

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      await loadAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Failed to delete assignment. Please try again.')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      await loadAssignments()
    } catch (error) {
      console.error('Error updating assignment status:', error)
      alert('Failed to update assignment status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      course: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      link: ''
    })
    setShowAddModal(false)
    setEditingAssignment(null)
  }

  // Quiz functions
  const generateQuiz = async (assignment) => {
    setQuizLoading(true)
    try {
      const prompt = `You are an educational quiz generator. Generate a quiz for the following course chapter:

Course: ${assignment.courseTitle}
Chapter: ${assignment.chapterTitle}
Description: ${assignment.description}

Create exactly 5 multiple choice questions that test understanding of this chapter. Return ONLY a valid JSON array with no additional text, markdown formatting, or explanations. Use this exact format:

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]

Requirements:
- Make questions educational and test understanding
- Each question must have exactly 4 options
- The "answer" field must match one of the options exactly
- Return ONLY the JSON array, nothing else`

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      
      // Extract JSON from response
      let quizData
      try {
        // Clean the response text
        let responseText = data.response.trim()
        
        // Remove markdown code blocks if present
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        // Try to find JSON array in the response
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/g)
        if (jsonMatch && jsonMatch.length > 0) {
          quizData = JSON.parse(jsonMatch[0])
        } else {
          // Try parsing the whole response
          quizData = JSON.parse(responseText)
        }

        // Validate the quiz data
        if (!Array.isArray(quizData) || quizData.length === 0) {
          throw new Error('Invalid quiz format')
        }

        // Validate each question
        quizData = quizData.slice(0, 5).map(q => {
          if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer) {
            throw new Error('Invalid question format')
          }
          return {
            question: q.question,
            options: q.options,
            answer: q.answer
          }
        })

      } catch (e) {
        console.error('Quiz parsing error:', e)
        // Fallback quiz with generic questions
        quizData = [
          {
            question: `What is the main topic covered in "${assignment.chapterTitle}"?`,
            options: [
              "The chapter covers the fundamental concepts",
              "Advanced techniques and applications",
              "Historical background and context",
              "Practical examples and use cases"
            ],
            answer: "The chapter covers the fundamental concepts"
          },
          {
            question: `Which of the following best describes the key learning objective of "${assignment.chapterTitle}"?`,
            options: [
              "Understanding core principles",
              "Memorizing definitions",
              "Learning advanced algorithms",
              "Developing practical skills"
            ],
            answer: "Understanding core principles"
          },
          {
            question: "What is an important concept discussed in this chapter?",
            options: [
              "Basic theoretical foundations",
              "Complex mathematical proofs",
              "Historical timeline",
              "Future predictions"
            ],
            answer: "Basic theoretical foundations"
          },
          {
            question: "How can you apply the knowledge from this chapter?",
            options: [
              "In real-world problem solving",
              "Only in theoretical scenarios",
              "In completely unrelated fields",
              "Cannot be applied practically"
            ],
            answer: "In real-world problem solving"
          },
          {
            question: "What is the key takeaway from this chapter?",
            options: [
              "Understanding the fundamental concepts presented",
              "Memorizing all the details",
              "Skipping to the next chapter",
              "Focusing only on examples"
            ],
            answer: "Understanding the fundamental concepts presented"
          }
        ]
      }

      // Save quiz to assignment in Supabase
      if (user) {
        const { error } = await supabase
          .from('assignments')
          .update({ quizzes: quizData })
          .eq('id', assignment.id)
          .eq('user_id', user.id)

        if (error) throw error
      }
      
      setQuizQuestions(quizData)
      setQuizAnswers({})
      setQuizResult(null)
      
      // Reload assignments to get updated data
      await loadAssignments()
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
      setQuizLoading(false)
    } finally {
      setQuizLoading(false)
    }
  }

  const openQuiz = async (assignment) => {
    setActiveQuizAssignment(assignment)
    setShowQuizModal(true)
    
    // Check if assignment already has quizzes
    if (assignment.quizzes && assignment.quizzes.length > 0) {
      setQuizQuestions(assignment.quizzes)
      setQuizAnswers({})
      setQuizResult(null)
    } else {
      // Auto-generate quiz when opening for the first time
      await generateQuiz(assignment)
    }
  }

  const submitQuiz = async () => {
    let correct = 0
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        correct++
      }
    })
    const resultObj = {
      score: correct,
      total: quizQuestions.length,
      percentage: Math.round((correct / quizQuestions.length) * 100)
    }
    setQuizResult(resultObj)
    // Mark assignment as completed and save quiz result after quiz attempt
    if (activeQuizAssignment) {
      // Update assignment with quiz result in Supabase
      if (user && activeQuizAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update({ 
            status: 'completed', 
            quiz_result: resultObj 
          })
          .eq('id', activeQuizAssignment.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error saving quiz result:', error)
          alert('Failed to save quiz result')
          return
        }
      }

      // Reload assignments to get updated data
      await loadAssignments()
    }
  }

  const closeQuiz = () => {
    setShowQuizModal(false)
    setActiveQuizAssignment(null)
    setQuizQuestions([])
    setQuizAnswers({})
    setQuizResult(null)
    setQuizLoading(false)
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = selectedFilter === 'all' || assignment.status === selectedFilter;
    const matchesSearch =
      (assignment.title && assignment.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (assignment.course && assignment.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Add overdue status
    const daysUntil = getDaysUntilDue(assignment.dueDate);
    if (daysUntil < 0 && assignment.status !== 'completed') {
      assignment.status = 'overdue';
    }

    return matchesFilter && matchesSearch;
  });

  const stats = [
    {
      label: 'Total',
      value: assignments.length,
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending',
      value: assignments.filter(a => a.status === 'pending').length,
      icon: Circle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'In Progress',
      value: assignments.filter(a => a.status === 'in-progress').length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Completed',
      value: assignments.filter(a => a.status === 'completed').length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const filters = [
    { id: 'all', label: 'All Assignments' },
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'overdue', label: 'Overdue' }
  ]

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
            <p className="text-gray-600">Track and manage your course assignments</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-3 rounded-lg border whitespace-nowrap transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'No assignments available yet'}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const statusColors = getStatusColor(assignment.status)
              const daysUntil = getDaysUntilDue(assignment.dueDate)
              const isOverdue = daysUntil < 0 && assignment.status !== 'completed'
              const isCompleted = assignment.status === 'completed'
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                            <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                              {assignment.course}
                            </span>
                            <span className={`px-3 py-1 ${statusColors.bg} ${statusColors.text} rounded-full font-semibold capitalize`}>
                              {assignment.status.replace('-', ' ')}
                            </span>
                            <span className={`font-semibold ${getPriorityColor(assignment.priority)} capitalize`}>
                              {assignment.priority} Priority
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{assignment.description}</p>
                          {/* Due Date */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="text-gray-600">
                                Due: <span className="font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </span>
                            </div>
                            {!isCompleted && (
                              assignment.status !== 'completed' && (
                                <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                                  {isOverdue ? <AlertCircle size={16} /> : <Clock size={16} />}
                                  <span className="font-semibold">
                                    {isOverdue 
                                      ? `Overdue by ${Math.abs(daysUntil)} days` 
                                      : daysUntil === 0 
                                      ? 'Due today!' 
                                      : `${daysUntil} days left`
                                    }
                                  </span>
                                </div>
                              )
                            )}
                            {assignment.link && (
                              <a
                                href={assignment.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <LinkIcon size={16} />
                                <span>View Link</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQuiz(assignment)}
                        className="px-4 py-2 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        disabled={isCompleted}
                      >
                        {assignment.quizzes && assignment.quizzes.length > 0 ? (
                          <>
                            <CheckCircle2 size={18} />
                            Take Quiz
                          </>
                        ) : (
                          <>
                            <ClipboardCheck size={18} />
                            Generate Quiz
                          </>
                        )}
                      </button>
                      {/* Status dropdown removed. Status is now only shown as a label above. */}
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                        disabled={isCompleted}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        disabled={isCompleted}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="Course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                    placeholder="Assignment description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAssignment}
                  className="px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
                >
                  {editingAssignment ? 'Update' : 'Add'} Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeQuizAssignment?.chapterTitle || 'Quiz'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeQuizAssignment?.courseTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!quizLoading && !quizResult && quizQuestions.length > 0 && (
                    <button
                      onClick={() => generateQuiz(activeQuizAssignment)}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Regenerate Quiz"
                    >
                      Regenerate
                    </button>
                  )}
                  <button
                    onClick={closeQuiz}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {quizLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">Generating quiz questions...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                ) : quizResult ? (
                  <div className="text-center py-8">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                      quizResult.percentage >= 80 ? 'bg-green-100' : 
                      quizResult.percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-3xl font-bold ${
                        quizResult.percentage >= 80 ? 'text-green-600' : 
                        quizResult.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {quizResult.percentage}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {quizResult.percentage >= 80 ? 'Excellent Work!' : 
                       quizResult.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-gray-600 mb-8">
                      You scored {quizResult.score} out of {quizResult.total} questions correctly
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={closeQuiz}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setQuizResult(null)
                          setQuizAnswers({})
                        }}
                        className="px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                ) : quizQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong> Answer all 5 questions and click "Submit Quiz" to see your score.
                      </p>
                    </div>
                    {quizQuestions.map((question, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          {idx + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                quizAnswers[idx] === option
                                  ? 'bg-[#F5C832] border-[#F5C832] text-gray-900'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${idx}`}
                                value={option}
                                checked={quizAnswers[idx] === option}
                                onChange={(e) => setQuizAnswers({ ...quizAnswers, [idx]: e.target.value })}
                                className="w-4 h-4 text-[#F5C832] focus:ring-[#F5C832]"
                              />
                              <span className="text-gray-700 flex-1">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        {Object.keys(quizAnswers).length} of {quizQuestions.length} questions answered
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={closeQuiz}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                          className="px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardCheck size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quiz available</h3>
                    <p className="text-gray-600">Click the button below to generate a quiz</p>
                    <button
                      onClick={() => generateQuiz(activeQuizAssignment)}
                      className="mt-4 px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
                    >
                      Generate Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
