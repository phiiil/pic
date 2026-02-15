import { NextRequest, NextResponse } from 'next/server'
import { getResults } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const project_id = searchParams.get('project_id')
      ? parseInt(searchParams.get('project_id')!)
      : undefined
    const engine = searchParams.get('engine') || undefined
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : undefined
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined

    const results = getResults({ project_id, engine, limit, offset })
    
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

