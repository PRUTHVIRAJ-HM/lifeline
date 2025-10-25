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

  const loadAssignments = () => {
    // Mock data - In production, fetch from Supabase
    const mockAssignments = [
      {
        id: 1,
        title: 'Build a Portfolio Website',
        course: 'Web Development',
        description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript',
        dueDate: '2025-10-30',
        priority: 'high',
        status: 'in-progress',
        link: 'https://github.com/...',
        createdAt: '2025-10-15'
      },
      {
        id: 2,
        title: 'Design System Documentation',
        course: 'UI/UX Design',
        description: 'Document the complete design system with components and guidelines',
        dueDate: '2025-10-28',
        priority: 'high',
        status: 'pending',
        link: 'https://figma.com/...',
        createdAt: '2025-10-18'
      },
      {
        id: 3,
        title: 'Data Analysis Report',
        course: 'Data Science',
        description: 'Analyze the dataset and create visualizations with Python',
        dueDate: '2025-11-05',
        priority: 'medium',
        status: 'pending',
        link: '',
        createdAt: '2025-10-20'
      },
      {
        id: 4,
        title: 'React Native App',
        course: 'Mobile Development',
        description: 'Build a simple todo app using React Native',
        dueDate: '2025-10-25',
        priority: 'high',
        status: 'completed',
        link: 'https://github.com/...',
        createdAt: '2025-10-10'
      },
      {
        id: 5,
        title: 'REST API Development',
        course: 'Backend Development',
        description: 'Create a RESTful API with Node.js and Express',
        dueDate: '2025-11-08',
        priority: 'medium',
        status: 'pending',
        link: '',
        createdAt: '2025-10-22'
      }
    ]
    setAssignments(mockAssignments)
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

  const handleAddAssignment = () => {
    if (!formData.title || !formData.course || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    const newAssignment = {
      id: assignments.length + 1,
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingAssignment) {
      setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...newAssignment, id: editingAssignment.id } : a))
    } else {
      setAssignments([...assignments, newAssignment])
    }

    resetForm()
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

  const handleDeleteAssignment = (id) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== id))
    }
  }

  const handleStatusChange = (id, newStatus) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, status: newStatus } : a))
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = selectedFilter === 'all' || assignment.status === selectedFilter
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Add overdue status
    const daysUntil = getDaysUntilDue(assignment.dueDate)
    if (daysUntil < 0 && assignment.status !== 'completed') {
      assignment.status = 'overdue'
    }
    
    return matchesFilter && matchesSearch
  })

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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            Add Assignment
          </button>
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
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first assignment'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={20} />
                  Add Assignment
                </button>
              )}
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const statusColors = getStatusColor(assignment.status)
              const daysUntil = getDaysUntilDue(assignment.dueDate)
              const isOverdue = daysUntil < 0 && assignment.status !== 'completed'
              
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
                            {assignment.status !== 'completed' && (
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
                      <select
                        value={assignment.status}
                        onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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
      </div>
    </DashboardLayout>
  )
}
