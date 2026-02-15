import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { insertResult } from '@/lib/db'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { prompt, project_id } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (!project_id || typeof project_id !== 'number') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const latency = Date.now() - startTime

    // Save to database
    try {
      insertResult({
        project_id,
        prompt,
        engine: 'Google',
        response,
        metadata: {
          model: 'gemini-pro',
          latency,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // Continue even if database save fails
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Google API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response from Google' },
      { status: 500 }
    )
  }
}

