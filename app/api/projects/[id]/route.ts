import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject, deleteProject } from '@/lib/db'

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

    const project = getProjectById(id)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { name, description } = await request.json()
    const project = updateProject(id, { name, description })

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    )
  }
}

