import { NextResponse } from 'next/server'

export async function POST(request) {
  // Parse once so we can reuse in error path
  const body = await request.json().catch(() => ({}))
  const {
    answer = '',
    field = 'General',
    subcategory = 'General',
    question = '',
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

    // Build prompt for feedback
    let prompt = `You are an expert interviewer evaluating a candidate's answer for a ${field} position (${subcategory}).\n\n`
    prompt += `Interview Question: ${question}\n`
    prompt += `Candidate's Answer: ${answer}\n\n`
    prompt += `Provide brief, constructive feedback on their answer. Focus on:\n`
    prompt += `1. Clarity and relevance\n`
    prompt += `2. Key strengths in the response\n`
    prompt += `3. One suggestion for improvement\n\n`
    prompt += `Keep feedback to 3-4 sentences, professional and encouraging.`

    // Call Ollama Cloud API for feedback
    const baseUrl = process.env.OLLAMA_BASE_URL || 'https://api.ollamahub.com/v1'
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
            content: 'You are an expert interviewer providing constructive feedback. Be encouraging but honest.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ollama API error:', response.status, errorText)
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const feedback = data.choices[0]?.message?.content?.trim() || 'Thank you for your answer. Let\'s move on to the next question.'
    
    return NextResponse.json({
      feedback,
      success: true
    })

  } catch (error) {
    console.error('Error processing answer:', error)
    
    // Try Gemini API fallback
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY
      if (GEMINI_API_KEY) {
        let geminiPrompt = `You are an expert interviewer evaluating a candidate's answer for a ${field} position (${subcategory}).\n\n`
        geminiPrompt += `Interview Question: ${question}\n`
        geminiPrompt += `Candidate's Answer: ${answer}\n\n`
        geminiPrompt += `Provide brief, constructive feedback on their answer. Focus on:\n`
        geminiPrompt += `1. Clarity and relevance\n`
        geminiPrompt += `2. Key strengths in the response\n`
        geminiPrompt += `3. One suggestion for improvement\n\n`
        geminiPrompt += `Keep feedback to 3-4 sentences, professional and encouraging.`

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
            })
          })

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const geminiFeedback = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Thank you for your answer. Your response shows good understanding of the topic.'
          return NextResponse.json({
            feedback: geminiFeedback,
            success: true
          })
        }
      }
    } catch (geminiError) {
      console.error('Gemini API fallback error:', geminiError)
    }
    
    return NextResponse.json({
      feedback: 'Thank you for your answer. Your response shows good understanding of the topic.',
      success: true
    })
  }
}
