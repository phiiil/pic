import { NextRequest, NextResponse } from 'next/server'
import { getStepsByProjectId, getResultCountForStep } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const steps = getStepsByProjectId(id)
    // Add result count to each step
    const stepsWithCounts = steps.map(step => ({
      ...step,
      resultCount: getResultCountForStep(step.id)
    }))
    return NextResponse.json({ steps: stepsWithCounts })
  } catch (error: any) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch steps' },
      { status: 500 }
    )
  }
}

