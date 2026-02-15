import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
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

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const response =
      message.content[0]?.type === 'text'
        ? message.content[0].text
        : 'No response generated'

    const latency = Date.now() - startTime

    // Save to database
    try {
      insertResult({
        step_id,
        prompt,
        engine: 'Anthropic',
        response,
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          tokens: message.usage?.input_tokens && message.usage?.output_tokens
            ? message.usage.input_tokens + message.usage.output_tokens
            : undefined,
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
    console.error('Anthropic API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response from Anthropic' },
      { status: 500 }
    )
  }
}

