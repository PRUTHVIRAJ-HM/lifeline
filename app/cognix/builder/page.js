'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Plus,
  Trash2,
  Download,
  FileText,
  Linkedin,
  Github,
  Globe
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function CognixBuilderPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const supabase = createClient()

  // Resume data state
  const [resumeData, setResumeData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    
    // Experience
    experience: [
      { company: '', position: '', startDate: '', endDate: '', description: '', current: false }
    ],
    
    // Education
    education: [
      { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
    ],
    
    // Skills
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    
    // Projects
    projects: [
      { name: '', description: '', technologies: '', link: '' }
    ],
    
    // Certifications
    certifications: [
      { name: '', issuer: '', date: '', credentialId: '' }
    ]
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setResumeData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
        email: user.email || ''
      }))
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const updateField = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field, defaultItem) => {
    setResumeData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }))
  }

  const removeArrayItem = (field, index) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field, index, key, value) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }))
  }

  const addSkill = (category, skill) => {
    if (skill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [category]: [...prev.skills[category], skill.trim()]
        }
      }))
    }
  }

  const removeSkill = (category, index) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }))
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    let yPosition = 20

    // Header - Personal Info
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(resumeData.fullName, 105, yPosition, { align: 'center' })
    yPosition += 10

    // Contact Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.location
    ].filter(Boolean).join(' | ')
    doc.text(contactInfo, 105, yPosition, { align: 'center' })
    yPosition += 5

    // Links
    const links = [
      resumeData.linkedin && `LinkedIn: ${resumeData.linkedin}`,
      resumeData.github && `GitHub: ${resumeData.github}`,
      resumeData.website && `Website: ${resumeData.website}`
    ].filter(Boolean).join(' | ')
    if (links) {
      doc.text(links, 105, yPosition, { align: 'center' })
      yPosition += 10
    } else {
      yPosition += 5
    }

    // Summary
    if (resumeData.summary) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('PROFESSIONAL SUMMARY', 20, yPosition)
      yPosition += 7
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const summaryLines = doc.splitTextToSize(resumeData.summary, 170)
      doc.text(summaryLines, 20, yPosition)
      yPosition += summaryLines.length * 5 + 5
    }

    // Experience
    if (resumeData.experience.some(exp => exp.company || exp.position)) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('EXPERIENCE', 20, yPosition)
      yPosition += 7

      resumeData.experience.forEach(exp => {
        if (exp.position || exp.company) {
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(exp.position, 20, yPosition)
          
          doc.setFont('helvetica', 'normal')
          const dateRange = exp.current 
            ? `${exp.startDate} - Present` 
            : `${exp.startDate} - ${exp.endDate}`
          doc.text(dateRange, 190, yPosition, { align: 'right' })
          yPosition += 5

          doc.setFontSize(10)
          doc.setFont('helvetica', 'italic')
          doc.text(exp.company, 20, yPosition)
          yPosition += 5

          if (exp.description) {
            doc.setFont('helvetica', 'normal')
            const descLines = doc.splitTextToSize(exp.description, 170)
            doc.text(descLines, 20, yPosition)
            yPosition += descLines.length * 5 + 3
          }
          yPosition += 2
        }
      })
      yPosition += 3
    }

    // Education
    if (resumeData.education.some(edu => edu.institution || edu.degree)) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('EDUCATION', 20, yPosition)
      yPosition += 7

      resumeData.education.forEach(edu => {
        if (edu.degree || edu.institution) {
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, 20, yPosition)
          
          doc.setFont('helvetica', 'normal')
          const dateRange = `${edu.startDate} - ${edu.endDate}`
          doc.text(dateRange, 190, yPosition, { align: 'right' })
          yPosition += 5

          doc.setFontSize(10)
          doc.setFont('helvetica', 'italic')
          doc.text(edu.institution, 20, yPosition)
          
          if (edu.gpa) {
            doc.text(`GPA: ${edu.gpa}`, 190, yPosition, { align: 'right' })
          }
          yPosition += 7
        }
      })
      yPosition += 3
    }

    // Skills
    const hasSkills = resumeData.skills.technical.length > 0 || 
                      resumeData.skills.soft.length > 0 || 
                      resumeData.skills.languages.length > 0

    if (hasSkills) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('SKILLS', 20, yPosition)
      yPosition += 7

      doc.setFontSize(10)
      if (resumeData.skills.technical.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Technical Skills:', 20, yPosition)
        doc.setFont('helvetica', 'normal')
        const techSkills = resumeData.skills.technical.join(', ')
        const techLines = doc.splitTextToSize(techSkills, 150)
        doc.text(techLines, 55, yPosition)
        yPosition += techLines.length * 5 + 2
      }

      if (resumeData.skills.soft.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Soft Skills:', 20, yPosition)
        doc.setFont('helvetica', 'normal')
        const softSkills = resumeData.skills.soft.join(', ')
        const softLines = doc.splitTextToSize(softSkills, 150)
        doc.text(softLines, 55, yPosition)
        yPosition += softLines.length * 5 + 2
      }

      if (resumeData.skills.languages.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Languages:', 20, yPosition)
        doc.setFont('helvetica', 'normal')
        const langs = resumeData.skills.languages.join(', ')
        const langLines = doc.splitTextToSize(langs, 150)
        doc.text(langLines, 55, yPosition)
        yPosition += langLines.length * 5 + 2
      }
      yPosition += 3
    }

    // Projects
    if (resumeData.projects.some(proj => proj.name || proj.description)) {
      if (yPosition > 240) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('PROJECTS', 20, yPosition)
      yPosition += 7

      resumeData.projects.forEach(proj => {
        if (proj.name) {
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(proj.name, 20, yPosition)
          yPosition += 5

          if (proj.description) {
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            const projLines = doc.splitTextToSize(proj.description, 170)
            doc.text(projLines, 20, yPosition)
            yPosition += projLines.length * 5
          }

          if (proj.technologies) {
            doc.setFont('helvetica', 'italic')
            doc.text(`Technologies: ${proj.technologies}`, 20, yPosition)
            yPosition += 5
          }

          if (proj.link) {
            doc.setFont('helvetica', 'normal')
            doc.text(`Link: ${proj.link}`, 20, yPosition)
            yPosition += 5
          }
          yPosition += 3
        }
      })
      yPosition += 3
    }

    // Certifications
    if (resumeData.certifications.some(cert => cert.name || cert.issuer)) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('CERTIFICATIONS', 20, yPosition)
      yPosition += 7

      resumeData.certifications.forEach(cert => {
        if (cert.name) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text(cert.name, 20, yPosition)
          
          if (cert.date) {
            doc.setFont('helvetica', 'normal')
            doc.text(cert.date, 190, yPosition, { align: 'right' })
          }
          yPosition += 5

          if (cert.issuer) {
            doc.setFont('helvetica', 'italic')
            doc.text(cert.issuer, 20, yPosition)
            yPosition += 5
          }

          if (cert.credentialId) {
            doc.setFont('helvetica', 'normal')
            doc.text(`Credential ID: ${cert.credentialId}`, 20, yPosition)
            yPosition += 5
          }
          yPosition += 2
        }
      })
    }

    // Save the PDF
    const fileName = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    doc.save(fileName)
  }

  const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Experience', icon: Briefcase },
    { id: 3, name: 'Education', icon: GraduationCap },
    { id: 4, name: 'Skills', icon: Code },
    { id: 5, name: 'Projects & Certs', icon: Award }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/cognix')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cognix Builder</h1>
              <p className="text-sm text-gray-600">Create your professional resume</p>
            </div>
          </div>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
          >
            <Download size={20} />
            Download Resume
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      currentStep === step.id
                        ? 'text-[#F5C832]'
                        : currentStep > step.id
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep === step.id
                          ? 'bg-[#F5C832] border-[#F5C832] text-gray-900'
                          : currentStep > step.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <StepIcon size={20} />
                    </div>
                    <span className="text-xs font-medium">{step.name}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all ${
                        currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={resumeData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={resumeData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={resumeData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={resumeData.linkedin}
                      onChange={(e) => updateField('linkedin', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={resumeData.github}
                      onChange={(e) => updateField('github', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="github.com/johndoe"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website/Portfolio
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={resumeData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                      placeholder="www.johndoe.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                  placeholder="A brief summary of your professional background, skills, and career goals..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
                <p className="text-gray-600">Add your professional experience</p>
              </div>

              {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Experience #{index + 1}</h3>
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('experience', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Tech Company Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Jan 2020"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Dec 2022"
                        disabled={exp.current}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateArrayItem('experience', index, 'current', e.target.checked)}
                        className="w-4 h-4 text-[#F5C832] focus:ring-[#F5C832] border-gray-300 rounded"
                      />
                      I currently work here
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addArrayItem('experience', { 
                  company: '', position: '', startDate: '', endDate: '', description: '', current: false 
                })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F5C832] hover:text-[#F5C832] transition-colors"
              >
                <Plus size={20} />
                Add Another Experience
              </button>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
                <p className="text-gray-600">Add your educational background</p>
              </div>

              {resumeData.education.map((edu, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Education #{index + 1}</h3>
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('education', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="University Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Bachelor of Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateArrayItem('education', index, 'field', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA (Optional)
                      </label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateArrayItem('education', index, 'gpa', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="3.8/4.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateArrayItem('education', index, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="2016"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateArrayItem('education', index, 'endDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addArrayItem('education', { 
                  institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' 
                })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F5C832] hover:text-[#F5C832] transition-colors"
              >
                <Plus size={20} />
                Add Another Education
              </button>
            </div>
          )}

          {/* Step 4: Skills */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
                <p className="text-gray-600">Add your technical and soft skills</p>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Technical Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {resumeData.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('technical', index)}
                        className="hover:text-blue-900"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="technical-skill-input"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="e.g., React, Python, SQL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill('technical', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('technical-skill-input')
                      addSkill('technical', input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Soft Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {resumeData.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('soft', index)}
                        className="hover:text-green-900"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="soft-skill-input"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="e.g., Leadership, Communication"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill('soft', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('soft-skill-input')
                      addSkill('soft', input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {resumeData.skills.languages.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('languages', index)}
                        className="hover:text-purple-900"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="language-skill-input"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                    placeholder="e.g., English (Native), Spanish (Fluent)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill('languages', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('language-skill-input')
                      addSkill('languages', input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Projects & Certifications */}
          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Projects Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
                  <p className="text-gray-600">Showcase your notable projects</p>
                </div>

                {resumeData.projects.map((project, index) => (
                  <div key={index} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Project #{index + 1}</h3>
                      {resumeData.projects.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('projects', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="E-commerce Platform"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                          placeholder="Describe what the project does and your role in it..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Technologies Used
                        </label>
                        <input
                          type="text"
                          value={project.technologies}
                          onChange={(e) => updateArrayItem('projects', index, 'technologies', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Link
                        </label>
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => updateArrayItem('projects', index, 'link', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addArrayItem('projects', { 
                    name: '', description: '', technologies: '', link: '' 
                  })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F5C832] hover:text-[#F5C832] transition-colors"
                >
                  <Plus size={20} />
                  Add Another Project
                </button>
              </div>

              {/* Certifications Section */}
              <div className="space-y-6 pt-8 border-t-2 border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications</h2>
                  <p className="text-gray-600">Add your professional certifications</p>
                </div>

                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className="p-6 border-2 border-gray-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Certification #{index + 1}</h3>
                      {resumeData.certifications.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('certifications', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certification Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="Amazon Web Services"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Obtained
                        </label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateArrayItem('certifications', index, 'date', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="Jan 2023"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credential ID
                        </label>
                        <input
                          type="text"
                          value={cert.credentialId}
                          onChange={(e) => updateArrayItem('certifications', index, 'credentialId', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
                          placeholder="ABC123456"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addArrayItem('certifications', { 
                    name: '', issuer: '', date: '', credentialId: '' 
                  })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#F5C832] hover:text-[#F5C832] transition-colors"
                >
                  <Plus size={20} />
                  Add Another Certification
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-6 py-3 bg-[#F5C832] hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                <FileText size={20} />
                Generate Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
