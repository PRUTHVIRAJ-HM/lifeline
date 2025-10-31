"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, TrendingUp, AlertCircle, Lightbulb, Star, Target, Award, BarChart3 } from "lucide-react"

export default function InterviewResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const field = searchParams.get("field") || "General"
  const subcategory = searchParams.get("subcategory") || "General"

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])

  useEffect(() => {
    // Get conversation history from session storage
    const historyStr = sessionStorage.getItem('interviewHistory')
    if (!historyStr) {
      router.push('/cognix/interview')
      return
    }

    const history = JSON.parse(historyStr)
    setConversationHistory(history)
    analyzeInterview(history)
  }, [])

  const analyzeInterview = async (history) => {
    try {
      const res = await fetch("/api/ollama/interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: history,
          field,
          subcategory
        })
      })
      const data = await res.json()
      setAnalytics(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5C832]"></div>
          <p className="mt-4 text-gray-600">Analyzing your interview performance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/cognix/interview')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Interviews</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Interview Results</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance</h2>
              <p className="text-gray-600">{field} - {subcategory}</p>
            </div>
            <div className={`flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(analytics?.overallScore || 0)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analytics?.overallScore || 0)}`}>
                  {analytics?.overallScore || 0}
                </div>
                <div className="text-sm text-gray-600">/ 100</div>
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-lg">{analytics?.summary || "Great effort on completing the interview!"}</p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Technical Skills */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Technical Skills</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(analytics?.technicalScore || 0)}`}>
                {analytics?.technicalScore || 0}
              </span>
              <span className="text-gray-500 mb-1">/ 100</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${analytics?.technicalScore >= 80 ? 'bg-green-500' : analytics?.technicalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${analytics?.technicalScore || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Communication */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Communication</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(analytics?.communicationScore || 0)}`}>
                {analytics?.communicationScore || 0}
              </span>
              <span className="text-gray-500 mb-1">/ 100</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${analytics?.communicationScore >= 80 ? 'bg-green-500' : analytics?.communicationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${analytics?.communicationScore || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Confidence</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(analytics?.confidenceScore || 0)}`}>
                {analytics?.confidenceScore || 0}
              </span>
              <span className="text-gray-500 mb-1">/ 100</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${analytics?.confidenceScore >= 80 ? 'bg-green-500' : analytics?.confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${analytics?.confidenceScore || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Key Strengths</h3>
          </div>
          <ul className="space-y-3">
            {analytics?.strengths?.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700 flex-1">{strength}</span>
              </li>
            )) || (
              <li className="text-gray-500">No strengths identified yet.</li>
            )}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {analytics?.improvements?.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span className="text-gray-700 flex-1">{improvement}</span>
              </li>
            )) || (
              <li className="text-gray-500">No improvements identified yet.</li>
            )}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-[#F5C832] to-yellow-400 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-[#F5C832]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {analytics?.recommendations?.map((recommendation, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                <span className="text-gray-900 flex-1 font-medium">{recommendation}</span>
              </li>
            )) || (
              <li className="text-gray-800">Keep practicing to improve your interview skills!</li>
            )}
          </ul>
        </div>

        {/* Interview Transcript */}
        {conversationHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Interview Transcript</h3>
            </div>
            <div className="space-y-6">
              {conversationHistory.map((item, idx) => (
                <div key={idx} className="border-l-4 border-gray-200 pl-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">QUESTION {idx + 1}</span>
                    <p className="text-gray-900 font-medium mt-1">{item.question}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#F5C832]">YOUR ANSWER</span>
                    <p className="text-gray-700 mt-1">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/cognix/interview/practice')}
            className="px-6 py-3 bg-[#F5C832] text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push('/cognix/interview')}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
