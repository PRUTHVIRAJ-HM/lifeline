"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mic, ArrowLeft, Volume2, Keyboard, Lightbulb, ArrowRight, MoreVertical } from "lucide-react"

function InterviewSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const field = searchParams.get("field") || "General"
  const subcategory = searchParams.get("subcategory") || "General"

  const [greetingDone, setGreetingDone] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [question, setQuestion] = useState("What are you looking for in your next job?")
  const [questionType, setQuestionType] = useState("Background question")
  const [questionIndex, setQuestionIndex] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [answer, setAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [aiResponse, setAiResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)

  // Play greeting audio using text-to-speech
  useEffect(() => {
    let greetingPlayed = false;
    const playGreeting = async () => {
      if (greetingPlayed) return;
      greetingPlayed = true;
      const greetingText = `Hey there! Ready to level up your ${field} skills? Let's practice by giving an interview.`;
      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      let hasEnded = false;
      utterance.onend = () => {
        if (hasEnded) return;
        hasEnded = true;
        setTimeout(() => {
          setGreetingDone(true);
          setConversationStarted(true);
          fetchInterviewQuestion();
        }, 2000);
      };
      // Wait for voices to load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Female')
        ) || voices.find(voice => 
          voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Zira') || voice.name.includes('Samantha'))
        ) || voices.find(voice => 
          voice.lang.includes('en')
        ) || voices[0];
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
      // Fallback: auto-start conversation after 8 seconds (to account for speech + 2 sec delay)
      const timer = setTimeout(() => {
        if (hasEnded) return;
        hasEnded = true;
        setGreetingDone(true);
        setConversationStarted(true);
        window.speechSynthesis.cancel();
        fetchInterviewQuestion();
      }, 8000);
      return () => {
        window.speechSynthesis.cancel();
        clearTimeout(timer);
      };
    };
    playGreeting();
    // eslint-disable-next-line
  }, [])

  // Fetch interview question from Ollama cloud
  const fetchInterviewQuestion = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ollama/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          field, 
          subcategory, 
          index: questionIndex,
          conversationHistory 
        })
      })
      const data = await res.json()
      setQuestion(data.question)
      setQuestionType(data.type || "Background question")
      setLoading(false)
      
      // Read out the question using text-to-speech
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(data.question)
        utterance.rate = 0.95
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Use the same female voice as greeting
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          const preferredVoice = voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Female')
          ) || voices.find(voice => 
            voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Zira') || voice.name.includes('Samantha'))
          ) || voices.find(voice => 
            voice.lang.includes('en')
          ) || voices[0]
          utterance.voice = preferredVoice
        }
        
        window.speechSynthesis.cancel() // Cancel any previous speech
        window.speechSynthesis.speak(utterance)
      }, 500) // Small delay to ensure UI has updated
      
    } catch (err) {
      // Keep default question if API fails
      setLoading(false)
    }
  }

  // Start recording audio with speech-to-text
  const startRecording = async () => {
    setIsRecording(true)
    setAnswer("")
    setAudioUrl(null)
    setIsTranscribing(true)
    audioChunksRef.current = []
    
    // Start audio recording
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new window.MediaRecorder(stream)
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      setAudioUrl(URL.createObjectURL(blob))
      setIsTranscribing(false)
    }
    mediaRecorderRef.current.start()
    
    // Start speech recognition for real-time transcription
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setAnswer(transcript)
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
      }
      
      recognitionRef.current.start()
    }
  }

  // Stop recording audio
  const stopRecording = () => {
    setIsRecording(false)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Submit answer (text or audio)
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.')
      return
    }
    
    setLoading(true)
    setLoadingMessage("Analyzing your response...")
    
    try {
      // Send answer to Ollama for feedback
      const res = await fetch("/api/ollama/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answer, 
          field, 
          subcategory, 
          question,
          conversationHistory 
        })
      })
      const data = await res.json()
      setAiResponse(data.feedback)
      
      // Add to conversation history
      const newHistory = [...conversationHistory, { question, answer }]
      setConversationHistory(newHistory)
      
      // Check if we've reached 5 questions
      if (questionIndex >= 5) {
        setLoading(false)
        setLoadingMessage("")
        // Save conversation history to session storage and navigate to results
        setTimeout(() => {
          sessionStorage.setItem('interviewHistory', JSON.stringify(newHistory))
          router.push(`/cognix/interview/results?field=${encodeURIComponent(field)}&subcategory=${encodeURIComponent(subcategory)}`)
        }, 3000)
        return
      }
      
      // Move to next question after showing feedback
      setTimeout(async () => {
        setLoadingMessage("Thinking...")
        setQuestionIndex(questionIndex + 1)
        setAnswer('')
        setAudioUrl(null)
        setAiResponse('')
        
        // Fetch next question with conversation history
        setLoadingMessage("Running speech analysis...")
        try {
          const nextRes = await fetch("/api/ollama/interview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              field, 
              subcategory, 
              index: questionIndex + 1,
              conversationHistory: newHistory 
            })
          })
          const nextData = await nextRes.json()
          setLoadingMessage("Preparing next question...")
          setQuestion(nextData.question)
          setQuestionType(nextData.type || "Interview question")
          setLoading(false)
          setLoadingMessage("")
          
          // Read out the next question using text-to-speech
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(nextData.question)
            utterance.rate = 0.95
            utterance.pitch = 1.0
            utterance.volume = 1.0
            
            // Use the same female voice
            const voices = window.speechSynthesis.getVoices()
            if (voices.length > 0) {
              const preferredVoice = voices.find(voice => 
                voice.lang.includes('en') && voice.name.includes('Female')
              ) || voices.find(voice => 
                voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Zira') || voice.name.includes('Samantha'))
              ) || voices.find(voice => 
                voice.lang.includes('en')
              ) || voices[0]
              utterance.voice = preferredVoice
            }
            
            window.speechSynthesis.cancel() // Cancel any previous speech
            window.speechSynthesis.speak(utterance)
          }, 500)
          
        } catch (err) {
          setLoading(false)
          setLoadingMessage("")
        }
      }, 3000)
      
    } catch (err) {
      setAiResponse("Could not get feedback. Please try again.")
      setLoading(false)
      setLoadingMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{field}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">interview</span>
              <span className="text-xl font-bold text-[#F5C832]">warmup</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Volume2 size={22} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={22} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-6">
        <div className="w-full max-w-3xl">
          {/* Loading Screen */}
          {loading && loadingMessage && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4285f4] to-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {loadingMessage}
                </h2>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 bg-[#4285f4] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#4285f4] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#4285f4] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          {/* Greeting Screen */}
          {!greetingDone && !loading && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#F5C832] to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                    <Volume2 size={48} className="text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Hey there! 👋
                </h2>
                <p className="text-xl text-gray-700 mb-2">
                  Ready to level up your <span className="font-semibold text-[#F5C832]">{field}</span> skills?
                </p>
                <p className="text-lg text-gray-600">
                  Let's practice by giving an interview!
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 bg-[#F5C832] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#F5C832] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#F5C832] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          {/* Question Card */}
          {greetingDone && !loading && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            {/* Question type badge and progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6366f1] rounded-full"></div>
                <span className="text-sm font-medium text-[#6366f1]">{questionType}</span>
              </div>
              <span className="text-sm font-semibold text-gray-400">{questionIndex}/{totalQuestions}</span>
            </div>
            
            {/* Question */}
            <h2 className="text-3xl font-semibold text-gray-900 mb-8 leading-tight">
              {question}
            </h2>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                className={`px-8 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 transition-all shadow-md ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-[#4285f4] hover:bg-[#3367d6] text-white'
                }`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                <Mic size={20} />
                {isRecording ? "Stop" : "Answer"}
              </button>
              
              <button
                className="ml-auto p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
                onClick={submitAnswer}
                disabled={loading || (!answer && !audioUrl)}
                title="Next question"
              >
                <ArrowRight size={24} className="text-[#4285f4]" />
              </button>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-sm font-medium text-red-900">Recording your answer...</span>
              </div>
            )}

            {/* Audio playback */}
            {audioUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}

            {/* AI feedback */}
            {aiResponse && (
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">AI Feedback</h3>
                <p className="text-gray-800">{aiResponse}</p>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <InterviewSessionContent />
    </Suspense>
  )
}
