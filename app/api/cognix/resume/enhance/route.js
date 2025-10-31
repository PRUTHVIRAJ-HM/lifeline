import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Different enhancement types
    switch (type) {
      case 'summary':
        return await generateSummary(data)
      case 'experience':
        return await enhanceExperience(data)
      case 'skills':
        return await suggestSkills(data)
      case 'parse':
        return await parseResumeText(data)
      default:
        return NextResponse.json({ error: "Invalid enhancement type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Enhancement error:", error)
    return NextResponse.json({ error: "Failed to enhance content" }, { status: 500 })
  }
}

async function generateSummary(data) {
  const { fullName, experience, skills, targetRole } = data

  const prompt = `Create a compelling professional summary for a resume. 

Name: ${fullName || 'Professional'}
Target Role: ${targetRole || 'Career professional'}
Experience: ${JSON.stringify(experience || [])}
Skills: ${JSON.stringify(skills || {})}

Write a 3-4 sentence professional summary that:
1. Highlights key expertise and years of experience
2. Mentions 2-3 most impressive achievements or skills
3. Shows career goals aligned with the target role
4. Is written in third person, professional tone
5. Focuses on value and impact

Return ONLY the summary text, nothing else.`

  try {
    // Try Ollama first
    const ollamaRes = await fetch("https://api.ollamahub.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss:120b-cloud",
        messages: [
          { role: "system", content: "You are a professional resume writer. Generate concise, impactful professional summaries." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (ollamaRes.ok) {
      const ollamaData = await ollamaRes.json()
      const summary = ollamaData.choices?.[0]?.message?.content?.trim()
      if (summary) {
        return NextResponse.json({ summary })
      }
    }
  } catch (err) {
    console.error("Ollama error:", err)
  }

  // Fallback to Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()?.trim()
    
    if (summary) {
      return NextResponse.json({ summary })
    }
  } catch (err) {
    console.error("Gemini error:", err)
  }

  // Final fallback
  return NextResponse.json({
    summary: `Results-driven professional with expertise in ${skills?.technical?.slice(0, 3).join(', ') || 'various technologies'}. Proven track record of delivering high-quality work and driving team success. Seeking to leverage skills and experience in ${targetRole || 'a challenging role'} to create meaningful impact.`
  })
}

async function enhanceExperience(data) {
  const { position, company, description, responsibilities } = data

  const prompt = `Enhance this work experience description for a resume:

Position: ${position}
Company: ${company}
Current Description: ${description || responsibilities || 'No description provided'}

Transform this into 3-5 powerful bullet points that:
1. Start with strong action verbs (Led, Developed, Implemented, Achieved, etc.)
2. Include quantifiable metrics where possible (increased by X%, managed $X, led team of X)
3. Highlight specific achievements and impact
4. Use professional, concise language
5. Focus on results and value delivered

Return ONLY the bullet points as an array of strings in JSON format:
{"bulletPoints": ["...", "...", ...]}`

  try {
    // Try Ollama
    const ollamaRes = await fetch("https://api.ollamahub.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss:120b-cloud",
        messages: [
          { role: "system", content: "You are a professional resume writer. Create impactful, achievement-focused bullet points. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (ollamaRes.ok) {
      const ollamaData = await ollamaRes.json()
      const content = ollamaData.choices?.[0]?.message?.content
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return NextResponse.json({ bulletPoints: parsed.bulletPoints })
          }
        } catch (parseErr) {
          console.error("Parse error:", parseErr)
        }
      }
    }
  } catch (err) {
    console.error("Ollama error:", err)
  }

  // Fallback to Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return NextResponse.json({ bulletPoints: parsed.bulletPoints })
        }
      } catch (parseErr) {
        console.error("Parse error:", parseErr)
      }
    }
  } catch (err) {
    console.error("Gemini error:", err)
  }

  // Final fallback
  return NextResponse.json({
    bulletPoints: [
      `Performed ${position} responsibilities at ${company}`,
      `Collaborated with cross-functional teams to achieve business objectives`,
      `Contributed to key projects and initiatives within the organization`
    ]
  })
}

async function suggestSkills(data) {
  const { position, company, experience, currentSkills } = data

  const prompt = `Suggest relevant skills for this professional profile:

Position: ${position || 'Professional'}
Company/Industry: ${company || 'General'}
Experience: ${JSON.stringify(experience || [])}
Current Skills: ${JSON.stringify(currentSkills || {})}

Suggest 8-12 skills divided into:
1. Technical Skills (programming languages, tools, technologies)
2. Soft Skills (leadership, communication, etc.)

Return ONLY as JSON:
{
  "technical": ["skill1", "skill2", ...],
  "soft": ["skill1", "skill2", ...]
}`

  try {
    // Try Ollama
    const ollamaRes = await fetch("https://api.ollamahub.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss:120b-cloud",
        messages: [
          { role: "system", content: "You are a career counselor. Suggest relevant, in-demand skills. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (ollamaRes.ok) {
      const ollamaData = await ollamaRes.json()
      const content = ollamaData.choices?.[0]?.message?.content
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const skills = JSON.parse(jsonMatch[0])
            return NextResponse.json({ skills })
          }
        } catch (parseErr) {
          console.error("Parse error:", parseErr)
        }
      }
    }
  } catch (err) {
    console.error("Ollama error:", err)
  }

  // Fallback to Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const skills = JSON.parse(jsonMatch[0])
          return NextResponse.json({ skills })
        }
      } catch (parseErr) {
        console.error("Parse error:", parseErr)
      }
    }
  } catch (err) {
    console.error("Gemini error:", err)
  }

  // Final fallback
  return NextResponse.json({
    skills: {
      technical: ["Microsoft Office", "Project Management", "Data Analysis", "Problem Solving"],
      soft: ["Communication", "Teamwork", "Leadership", "Time Management"]
    }
  })
}

async function parseResumeText(data) {
  const { text } = data

  const prompt = `Parse this resume text and extract structured information:

${text}

Extract and return as JSON:
{
  "fullName": "extracted name",
  "email": "extracted email",
  "phone": "extracted phone",
  "summary": "professional summary if found",
  "experience": [
    {
      "position": "job title",
      "company": "company name",
      "startDate": "start date",
      "endDate": "end date",
      "description": "job description"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "field": "field of study"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  }
}`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return NextResponse.json({ resumeData: parsed })
        }
      } catch (parseErr) {
        console.error("Parse error:", parseErr)
        console.error("Content received:", content)
      }
    }
  } catch (err) {
    console.error("Gemini error:", err)
  }

  return NextResponse.json({ 
    error: "Could not parse resume text. Please try again or enter manually." 
  }, { status: 400 })
}
