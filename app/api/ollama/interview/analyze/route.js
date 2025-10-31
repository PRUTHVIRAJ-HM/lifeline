import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { conversationHistory, field, subcategory } = body

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json({ 
        error: "No conversation history provided" 
      }, { status: 400 })
    }

    // Prepare the conversation for analysis
    const conversationText = conversationHistory
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join('\n\n')

    const analysisPrompt = `You are an expert interview coach analyzing a ${field} - ${subcategory} interview practice session. 

Conversation:
${conversationText}

Provide a comprehensive analysis with:
1. Overall Score (0-100): Based on answer quality, relevance, and depth
2. Technical Score (0-100): Domain knowledge and technical accuracy
3. Communication Score (0-100): Clarity, structure, and articulation
4. Confidence Score (0-100): Decisiveness and conviction in answers
5. Summary: 2-3 sentences overall assessment
6. Strengths: List 3-5 specific strengths demonstrated
7. Improvements: List 3-5 specific areas to improve
8. Recommendations: List 3-5 actionable next steps

Format your response EXACTLY as JSON:
{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "summary": "string",
  "strengths": ["string", "string", ...],
  "improvements": ["string", "string", ...],
  "recommendations": ["string", "string", ...]
}`

    // Try Ollama first
    try {
      const ollamaRes = await fetch("https://api.ollamahub.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-oss:120b-cloud",
          messages: [
            { role: "system", content: "You are an expert interview coach. Always respond with valid JSON only." },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json()
        const content = ollamaData.choices?.[0]?.message?.content
        
        if (content) {
          // Try to parse JSON from the response
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0])
              return NextResponse.json(analysis)
            }
          } catch (parseErr) {
            console.error("Failed to parse Ollama JSON:", parseErr)
          }
        }
      }
    } catch (ollamaErr) {
      console.error("Ollama analysis error:", ollamaErr)
    }

    // Fallback to Gemini
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: analysisPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          })
        }
      )

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        
        if (content) {
          // Try to parse JSON from the response
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0])
              return NextResponse.json(analysis)
            }
          } catch (parseErr) {
            console.error("Failed to parse Gemini JSON:", parseErr)
          }
        }
      }
    } catch (geminiErr) {
      console.error("Gemini analysis error:", geminiErr)
    }

    // Final fallback: Generate basic analysis based on conversation length and patterns
    const avgAnswerLength = conversationHistory.reduce((sum, item) => sum + item.answer.length, 0) / conversationHistory.length
    const hasNumbers = conversationHistory.some(item => /\d/.test(item.answer))
    const hasExamples = conversationHistory.some(item => /example|instance|case|time when|situation/i.test(item.answer))
    
    // Calculate scores based on patterns
    let technicalScore = 50
    let communicationScore = 50
    let confidenceScore = 50

    if (avgAnswerLength > 200) communicationScore += 20
    if (avgAnswerLength > 300) communicationScore += 10
    if (hasNumbers) technicalScore += 15
    if (hasExamples) {
      technicalScore += 15
      confidenceScore += 20
    }

    const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3)

    const fallbackAnalysis = {
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      summary: `You completed all ${conversationHistory.length} interview questions. ${overallScore >= 70 ? 'Good work!' : 'Keep practicing to improve your responses.'}`,
      strengths: [
        "Completed all interview questions",
        hasExamples ? "Provided concrete examples in your answers" : "Engaged with all questions presented",
        avgAnswerLength > 200 ? "Gave detailed, thorough responses" : "Answered all questions clearly"
      ],
      improvements: [
        avgAnswerLength < 150 ? "Provide more detailed answers with specific examples" : "Continue developing your responses with more depth",
        !hasNumbers ? `Include specific metrics and numbers relevant to ${field}` : "Continue using quantifiable results",
        `Research more about ${subcategory} best practices and terminology`
      ],
      recommendations: [
        `Study common ${field} interview questions and prepare structured answers`,
        "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
        `Review ${subcategory} technical concepts and industry trends`,
        "Record yourself answering questions to improve delivery and confidence"
      ]
    }

    return NextResponse.json(fallbackAnalysis)

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ 
      error: "Failed to analyze interview",
      overallScore: 50,
      technicalScore: 50,
      communicationScore: 50,
      confidenceScore: 50,
      summary: "Interview completed successfully. Keep practicing!",
      strengths: ["Completed the interview practice session"],
      improvements: ["Continue practicing to improve your interview skills"],
      recommendations: ["Practice more interviews to build confidence and skills"]
    }, { status: 200 })
  }
}
