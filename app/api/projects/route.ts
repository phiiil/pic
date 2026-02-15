import { NextRequest, NextResponse } from 'next/server'
import { createProject, getAllProjects, getResultCountForProject } from '@/lib/db'

export async function GET() {
  try {
    const projects = getAllProjects()
    // Add result count to each project
    const projectsWithCounts = projects.map(project => ({
      ...project,
      resultCount: getResultCountForProject(project.id)
    }))
    return NextResponse.json({ projects: projectsWithCounts })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = createProject({
      name: name.trim(),
      description: description?.trim() || undefined,
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}

