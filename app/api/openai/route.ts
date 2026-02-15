import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { insertResult } from '@/lib/db'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { prompt, step_id } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (!step_id || typeof step_id !== 'number') {
      return NextResponse.json(
        { error: 'Step ID is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'No response generated'
    const latency = Date.now() - startTime

    // Save to database
    try {
      insertResult({
        step_id,
        prompt,
        engine: 'OpenAI',
        response,
        metadata: {
          model: 'gpt-4',
          tokens: completion.usage?.total_tokens,
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
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response from OpenAI' },
      { status: 500 }
    )
  }
}

