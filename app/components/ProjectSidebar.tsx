'use client'

import { useState, useEffect } from 'react'

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
  resultCount?: number
}

interface ProjectSidebarProps {
  selectedProjectId: number | null
  selectedStepId: number | null
  onProjectSelect: (projectId: number) => void
  onStepSelect: (stepId: number) => void
  refreshTrigger?: number
}

export default function ProjectSidebar({
  selectedProjectId,
  selectedStepId,
  onProjectSelect,
  onStepSelect,
  refreshTrigger,
}: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [isLoadingSteps, setIsLoadingSteps] = useState(false)

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadProjects()
      // Reload steps if a project is selected to update counts
      if (selectedProjectId) {
        loadSteps(selectedProjectId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  useEffect(() => {
    if (selectedProjectId) {
      loadSteps(selectedProjectId)
    } else {
      setSteps([])
    }
  }, [selectedProjectId])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (response.ok) {
        setProjects(data.projects)
        // Auto-select first project if none selected
        if (!selectedProjectId && data.projects.length > 0) {
          onProjectSelect(data.projects[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSteps = async (projectId: number) => {
    setIsLoadingSteps(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/steps`)
      const data = await response.json()
      if (response.ok) {
        setSteps(data.steps)
      }
    } catch (error) {
      console.error('Error loading steps:', error)
    } finally {
      setIsLoadingSteps(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProjectName.trim()) {
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setProjects([data.project, ...projects])
        onProjectSelect(data.project.id)
        setNewProjectName('')
        setNewProjectDescription('')
        setShowCreateModal(false)
      } else {
        alert(data.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="w-64 bg-gray-900 shadow-xl min-h-screen p-4 flex flex-col border-r border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-gray-700">
          Batterie
        </h1>
        <div className="mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>New Project</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Projects
          </h2>

          {isLoading ? (
            <div className="text-gray-400 text-center py-4">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-gray-400 text-center py-4 text-sm">
              No projects yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id}>
                  <button
                    onClick={() => onProjectSelect(project.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedProjectId === project.id && !selectedStepId
                        ? 'bg-purple-900/50 border-2 border-purple-500'
                        : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </button>

                  {selectedProjectId === project.id && (
                    <div className="mt-2 ml-4 space-y-1">
                      {isLoadingSteps ? (
                        <div className="text-xs text-gray-500">Loading steps...</div>
                      ) : (
                        steps.map((step) => (
                          <button
                            key={step.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              onStepSelect(step.id)
                            }}
                            className={`w-full text-left text-xs py-2 px-3 rounded transition-colors flex items-center justify-between ${selectedStepId === step.id
                              ? 'bg-purple-800/50 border border-purple-500 text-white'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400'
                              }`}
                          >
                            <span>{step.name}</span>
                            {step.resultCount !== undefined && (
                              <span className="text-xs font-semibold text-gray-300 bg-gray-700 px-2 py-0.5 rounded ml-2">
                                {step.resultCount}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-400"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewProjectName('')
                    setNewProjectDescription('')
                  }}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProjectName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

