import { NextResponse } from 'next/server'

export async function POST(request) {
  // Parse body once so we can reuse values in catch
  const body = await request.json().catch(() => ({}))
  const {
    field = 'General',
    subcategory = 'General',
    index = 1,
    conversationHistory = []
  } = body || {}
  
  try {
    
    const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
    
    if (!OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'Ollama API key not configured' },
        { status: 500 }
      )
    }

    // Build context-aware prompt
    let prompt = `You are an experienced interviewer conducting a professional interview for a ${field} position, specifically focusing on ${subcategory}.`
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\n\nPrevious conversation:\n`
      conversationHistory.forEach((item, idx) => {
        prompt += `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}\n`
      })
      prompt += `\nBased on the candidate's previous answers, ask a relevant follow-up interview question that builds on their responses. `
    } else {
      prompt += `\n\nThis is question ${index} of 5. Ask an appropriate interview question for this stage. `
    }
    
    prompt += `Generate only the interview question without any additional text. The question should be professional, clear, and relevant to ${subcategory} in ${field}.`

    const baseUrl = process.env.OLLAMA_BASE_URL || 'https://api.ollamahub.com/v1'
    // Call Ollama Cloud API (OpenAI-compatible schema)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-oss:120b-cloud',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Generate only the interview question, nothing else.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ollama API error:', response.status, errorText)
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const question = data.choices[0]?.message?.content?.trim() || 'What interests you most about this role?'
    
    // Determine question type based on index
    const questionTypes = [
      'Background question',
      'Technical question', 
      'Behavioral question',
      'Situational question',
      'Closing question'
    ]
    
    return NextResponse.json({
      question,
      type: questionTypes[index - 1] || 'Interview question',
      index
    })

  } catch (error) {
    console.error('Error generating interview question:', error)
    // Try Gemini API fallback
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY
      if (GEMINI_API_KEY) {
        let geminiPrompt = `You are an experienced interviewer conducting a professional interview for a ${field} position, specifically focusing on ${subcategory}.`
        if (conversationHistory && conversationHistory.length > 0) {
          geminiPrompt += `\n\nPrevious conversation:\n`
          conversationHistory.forEach((item, idx) => {
            geminiPrompt += `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}\n`
          })
          geminiPrompt += `\nBased on the candidate's previous answers, ask a relevant follow-up interview question that builds on their responses. `
        } else {
          geminiPrompt += `\n\nThis is question ${index} of 5. Ask an appropriate interview question for this stage. `
        }
        geminiPrompt += `Generate only the interview question without any additional text. The question should be professional, clear, and relevant to ${subcategory} in ${field}.`

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
            })
          })

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const geminiQuestion = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'What interests you most about this role?'
          const questionTypes = [
            'Background question',
            'Technical question',
            'Behavioral question',
            'Situational question',
            'Closing question'
          ]
          return NextResponse.json({
            question: geminiQuestion,
            type: questionTypes[index - 1] || 'Interview question',
            index
          })
        }
      }
    } catch (geminiError) {
      console.error('Gemini API fallback error:', geminiError)
    }
    // Fallback questions
    const fallbackQuestions = [
      'Tell me about yourself and your background.',
      'What are your greatest strengths?',
      'Describe a challenging project you worked on.',
      'How do you handle tight deadlines and pressure?',
      'Why are you interested in this position?'
    ]
    const fallbackIndex = Math.min(Math.max(parseInt(index, 10) || 1, 1), 5)
    return NextResponse.json({
      question: fallbackQuestions[fallbackIndex - 1] || fallbackQuestions[0],
      type: 'Background question',
      index: fallbackIndex
    })
  }
}
