'use client'

import { useState, useEffect } from 'react'
import ProjectSidebar from './components/ProjectSidebar'
import ProjectResultsList from './components/ProjectResultsList'
import PromptWithResults from './components/PromptWithResults'

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface Step {
  id: number
  project_id: number
  name: string
  order_index: number
  created_at: string
}

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId)
    } else {
      setSelectedProject(null)
      setSelectedStepId(null)
    }
  }, [selectedProjectId])

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      if (response.ok) {
        setSelectedProject(data.project)
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  }

  const handleSubmissionComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId)
    setSelectedStepId(null) // Clear step selection when project is selected
  }

  const handleStepSelect = (stepId: number) => {
    setSelectedStepId(stepId)
    // Note: We keep selectedProjectId so steps remain visible, but visually it won't be highlighted
  }

  return (
    <div className="flex min-h-screen">
      <ProjectSidebar
        selectedProjectId={selectedProjectId}
        selectedStepId={selectedStepId}
        onProjectSelect={handleProjectSelect}
        onStepSelect={handleStepSelect}
        refreshTrigger={refreshKey}
      />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {selectedProject && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {selectedProject.name}
              </h2>
              {selectedProject.description && (
                <p className="text-white/80 text-lg drop-shadow">
                  {selectedProject.description}
                </p>
              )}
            </div>
          )}

          {selectedStepId ? (
            <PromptWithResults
              stepId={selectedStepId}
              onSubmissionComplete={handleSubmissionComplete}
            />
          ) : (
            <ProjectResultsList key={refreshKey} projectId={selectedProjectId} />
          )}
        </div>
      </main>
    </div>
  )
}

