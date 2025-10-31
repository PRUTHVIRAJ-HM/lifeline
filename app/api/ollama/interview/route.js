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

    // Build context-aware prompt with domain-specific details
    let prompt = `You are an experienced interviewer conducting a professional interview for a ${field} position, specifically focusing on ${subcategory}.

IMPORTANT: Ask questions that are HIGHLY SPECIFIC to ${subcategory} in ${field}. Do NOT ask generic questions.`
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\n\nPrevious conversation:\n`
      conversationHistory.forEach((item, idx) => {
        prompt += `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}\n`
      })
      prompt += `\n\nBased on the candidate's previous answers above, ask a FOLLOW-UP question that:
1. References or builds upon something specific they mentioned in their previous answers
2. Digs deeper into their ${subcategory} experience or knowledge
3. Tests their understanding of advanced ${subcategory} concepts
4. Is NOT a generic interview question - it must be tailored to their responses and the ${field} domain

Example approach: If they mentioned a specific tool, framework, or methodology, ask them to elaborate on how they used it, or present a scenario where they'd need to apply that knowledge.`
    } else {
      prompt += `\n\nThis is question ${index} of 5. Ask a SPECIFIC ${subcategory}-focused question for a ${field} position.

For example:
- If ${subcategory} is "Data Analytics": Ask about specific tools (SQL, Python, Tableau), data cleaning techniques, or analytical methodologies
- If ${subcategory} is "React Development": Ask about hooks, state management, performance optimization, or component architecture
- If ${subcategory} is "Cybersecurity": Ask about specific attack vectors, security protocols, or incident response procedures
- If ${subcategory} is "Cloud Computing": Ask about specific cloud platforms (AWS, Azure, GCP), architecture patterns, or DevOps practices

The question must be TECHNICAL and DOMAIN-SPECIFIC, not generic like "tell me about yourself" or "what are your strengths".`
    }
    
    prompt += `\n\nGenerate ONLY the interview question without any additional text. The question MUST be highly relevant to ${subcategory} in ${field}.`

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
        let geminiPrompt = `You are an experienced interviewer conducting a professional interview for a ${field} position, specifically focusing on ${subcategory}.

IMPORTANT: Ask questions that are HIGHLY SPECIFIC to ${subcategory} in ${field}. Do NOT ask generic questions.`
        
        if (conversationHistory && conversationHistory.length > 0) {
          geminiPrompt += `\n\nPrevious conversation:\n`
          conversationHistory.forEach((item, idx) => {
            geminiPrompt += `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}\n`
          })
          geminiPrompt += `\n\nBased on the candidate's previous answers above, ask a FOLLOW-UP question that:
1. References or builds upon something specific they mentioned in their previous answers
2. Digs deeper into their ${subcategory} experience or knowledge
3. Tests their understanding of advanced ${subcategory} concepts
4. Is NOT a generic interview question - it must be tailored to their responses and the ${field} domain`
        } else {
          geminiPrompt += `\n\nThis is question ${index} of 5. Ask a SPECIFIC ${subcategory}-focused question for a ${field} position.

The question must be TECHNICAL and DOMAIN-SPECIFIC to ${subcategory}, not generic interview questions.`
        }
        
        geminiPrompt += `\n\nGenerate ONLY the interview question without any additional text. The question MUST be highly relevant to ${subcategory} in ${field}.`

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
    
    // Domain-specific fallback questions
    const domainQuestions = {
      'Data Analytics': [
        'Describe your experience with SQL and how you would optimize a slow query.',
        'Walk me through your process for cleaning and preparing messy data.',
        'How would you approach building a dashboard to track key business metrics?',
        'Explain a time when your data analysis led to a significant business decision.',
        'What statistical methods do you use to validate your analytical findings?'
      ],
      'Digital Marketing and E-Commerce': [
        'How do you measure the success of a digital marketing campaign?',
        'Describe your experience with SEO and how you improve search rankings.',
        'What strategies would you use to increase conversion rates on an e-commerce site?',
        'How do you segment audiences for targeted marketing campaigns?',
        'Explain your approach to A/B testing for marketing content.'
      ],
      'IT Support': [
        'How would you troubleshoot a computer that won\'t connect to the network?',
        'Describe your experience with ticketing systems and prioritizing support requests.',
        'What steps would you take to diagnose a slow-running Windows system?',
        'How do you explain technical issues to non-technical users?',
        'Tell me about a challenging IT problem you resolved and how you approached it.'
      ],
      'Project Management': [
        'How do you handle scope creep in a project?',
        'Describe your experience with Agile or Scrum methodologies.',
        'How would you manage a project with tight deadlines and limited resources?',
        'Explain how you track and communicate project progress to stakeholders.',
        'What tools do you use for project planning and collaboration?'
      ],
      'UX Design': [
        'Walk me through your user research process.',
        'How do you approach designing for accessibility?',
        'Describe a time when user feedback changed your design direction.',
        'What methods do you use to test and validate your designs?',
        'How do you balance user needs with business requirements?'
      ],
      'Cybersecurity': [
        'How would you respond to a suspected data breach?',
        'Explain the difference between symmetric and asymmetric encryption.',
        'What security measures would you implement for a web application?',
        'Describe your experience with penetration testing or vulnerability assessments.',
        'How do you stay updated on the latest security threats and vulnerabilities?'
      ]
    }
    
    // Use domain-specific questions if available, otherwise generic fallback
    const fallbackQuestions = domainQuestions[field] || [
      `What specific experience do you have with ${subcategory}?`,
      `Describe a challenging ${subcategory} project you've worked on.`,
      `What tools or technologies do you use for ${subcategory} work?`,
      `How do you stay current with ${subcategory} best practices?`,
      `What would you say sets you apart in the ${subcategory} field?`
    ]
    const fallbackIndex = Math.min(Math.max(parseInt(index, 10) || 1, 1), 5)
    return NextResponse.json({
      question: fallbackQuestions[fallbackIndex - 1] || fallbackQuestions[0],
      type: 'Background question',
      index: fallbackIndex
    })
  }
}
