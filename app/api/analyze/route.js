import { GoogleGenerativeAI } from '@google/generative-ai'

const MAX_CHARS = 6000

const SYSTEM_INSTRUCTION = `You are an expert technical recruiter with 15+ years of experience evaluating resumes against job descriptions. Your task is to perform a precise skill-gap analysis.

Analyze the provided Job Description and Resume, then return ONLY a valid JSON object — no markdown, no code blocks, no prose, no explanation. Just raw JSON.

The JSON must match this EXACT structure:
{
  "matchScore": <integer 0-100>,
  "matchedSkills": [<array of strings — skills the candidate has that the JD requires>],
  "missingSkills": [
    {
      "skill": <string — name of the missing skill>,
      "importance": <"critical" | "important" | "nice-to-have">,
      "reason": <string — specific reason why this skill matters in the JD, 1-2 sentences>
    }
  ],
  "bulletRewrites": [
    {
      "before": <string — original weak resume bullet or experience description>,
      "after": <string — improved, quantified, JD-tailored version of the same point>
    }
  ]
}

Rules:
- matchScore: Holistic alignment score. Be honest — a score above 80 should be rare unless it's a near-perfect match.
- matchedSkills: Only include skills explicitly present in both the JD and the resume. Keep these concise (e.g., "React", "Python", "REST APIs").
- missingSkills: Rank all truly missing or underdeveloped skills. "critical" = mentioned multiple times or core to the role, "important" = clearly expected, "nice-to-have" = bonus/optional.
- bulletRewrites: Pick 3-5 actual bullets or experiences from the resume that are phrased weakly. Rewrite them to be stronger, quantified where possible, and explicitly reference JD keywords. The "before" must be a real excerpt from the resume, not invented.
- Be specific and honest. Do not be overly positive or inflate the score.
- Output ONLY the JSON object. No other text.`

export async function POST(request) {
  try {
    // 1. Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      )
    }

    const { jdText, resumeText } = body

    // 2. Validate inputs
    if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
      return Response.json(
        { error: 'Job description is required.' },
        { status: 400 }
      )
    }

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return Response.json(
        { error: 'Resume is required.' },
        { status: 400 }
      )
    }

    if (jdText.trim().length < 100) {
      return Response.json(
        { error: 'Job description is too short. Please paste the full job description (minimum 100 characters).' },
        { status: 400 }
      )
    }

    if (resumeText.trim().length < 100) {
      return Response.json(
        { error: 'Resume is too short. Please paste your full resume (minimum 100 characters).' },
        { status: 400 }
      )
    }

    if (jdText.length > MAX_CHARS) {
      return Response.json(
        { error: `Job description is too long. Please limit to ${MAX_CHARS.toLocaleString()} characters.` },
        { status: 400 }
      )
    }

    if (resumeText.length > MAX_CHARS) {
      return Response.json(
        { error: `Resume is too long. Please limit to ${MAX_CHARS.toLocaleString()} characters.` },
        { status: 400 }
      )
    }

    // 3. Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables.')
      return Response.json(
        { error: 'Server configuration error. The Gemini API key is not configured.' },
        { status: 500 }
      )
    }

    // 4. Build the prompt
    const userPrompt = `Here is the Job Description:
---
${jdText.trim()}
---

Here is the Candidate's Resume:
---
${resumeText.trim()}
---

Perform the skill-gap analysis and return only the JSON object as instructed.`

    // 5. Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    })

    let result
    try {
      result = await model.generateContent(userPrompt)
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)

      // Surface specific Gemini error types
      const message = geminiError?.message || ''
      if (message.includes('API key') || message.includes('PERMISSION_DENIED')) {
        return Response.json(
          { error: 'Invalid Gemini API key. Please check your configuration.' },
          { status: 500 }
        )
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        return Response.json(
          { error: 'Gemini API rate limit reached. Please wait a moment and try again.' },
          { status: 429 }
        )
      }
      if (message.includes('SAFETY')) {
        return Response.json(
          { error: 'The content was blocked by Gemini safety filters. Please review your input.' },
          { status: 400 }
        )
      }

      return Response.json(
        { error: 'Failed to get a response from the AI model. Please try again.' },
        { status: 502 }
      )
    }

    // 6. Extract and parse the JSON response
    const responseText = result.response.text()

    let parsed
    try {
      // Strip any accidental markdown fences Gemini might still add
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', responseText)
      return Response.json(
        { error: 'The AI returned an unexpected response format. Please try again.' },
        { status: 500 }
      )
    }

    // 7. Validate shape of parsed JSON
    if (
      typeof parsed.matchScore !== 'number' ||
      !Array.isArray(parsed.matchedSkills) ||
      !Array.isArray(parsed.missingSkills) ||
      !Array.isArray(parsed.bulletRewrites)
    ) {
      console.error('Gemini response missing required fields:', parsed)
      return Response.json(
        { error: 'The AI returned an incomplete analysis. Please try again.' },
        { status: 500 }
      )
    }

    // 8. Return the validated analysis
    return Response.json(parsed, { status: 200 })
  } catch (unexpectedError) {
    console.error('Unexpected error in /api/analyze:', unexpectedError)
    return Response.json(
      { error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
