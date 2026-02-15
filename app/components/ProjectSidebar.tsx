'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  resultCount?: number
}

interface ProjectSidebarProps {
  selectedProjectId: number | null
  onProjectSelect: (projectId: number) => void
  refreshTrigger?: number
}

export default function ProjectSidebar({
  selectedProjectId,
  onProjectSelect,
  refreshTrigger,
}: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

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
        // Add resultCount: 0 for new project
        const newProject = { ...data.project, resultCount: 0 }
        setProjects([newProject, ...projects])
        onProjectSelect(newProject.id)
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
      <div className="w-64 bg-white shadow-xl min-h-screen p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200">
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Projects
          </h2>

          {isLoading ? (
            <div className="text-gray-500 text-center py-4">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-gray-500 text-center py-4 text-sm">
              No projects yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${selectedProjectId === project.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {project.description}
                        </div>
                      )}
                    </div>
                    {project.resultCount !== undefined && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                          {project.resultCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProjectName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

