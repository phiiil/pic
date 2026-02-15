'use client'

import { useState, useEffect } from 'react'
import ResultCard from './components/ResultCard'
import ProjectSidebar from './components/ProjectSidebar'

interface EngineResult {
  result: string | null
  isLoading: boolean
  error: string | null
}

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<Record<string, EngineResult>>({
    OpenAI: { result: null, isLoading: false, error: null },
    Anthropic: { result: null, isLoading: false, error: null },
    Google: { result: null, isLoading: false, error: null },
  })

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId)
    } else {
      setSelectedProject(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      return
    }

    if (!selectedProjectId) {
      alert('Please select or create a project first')
      return
    }

    // Reset all results
    setResults({
      OpenAI: { result: null, isLoading: true, error: null },
      Anthropic: { result: null, isLoading: true, error: null },
      Google: { result: null, isLoading: true, error: null },
    })

    // Send requests to all three engines in parallel
    const engines = [
      { name: 'OpenAI', endpoint: '/api/openai' },
      { name: 'Anthropic', endpoint: '/api/anthropic' },
      { name: 'Google', endpoint: '/api/google' },
    ]

    engines.forEach(async ({ name, endpoint }) => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, project_id: selectedProjectId }),
        })

        const data = await response.json()

        if (!response.ok) {
          setResults((prev) => ({
            ...prev,
            [name]: {
              result: null,
              isLoading: false,
              error: data.error || 'Unknown error occurred',
            },
          }))
          return
        }

        setResults((prev) => ({
          ...prev,
          [name]: {
            result: data.response,
            isLoading: false,
            error: null,
          },
        }))
      } catch (error: any) {
        setResults((prev) => ({
          ...prev,
          [name]: {
            result: null,
            isLoading: false,
            error: error.message || 'Failed to fetch response',
          },
        }))
      }
    })
  }

  return (
    <div className="flex min-h-screen">
      <ProjectSidebar
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
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

          <form onSubmit={handleSubmit} className="mb-12">
            <div className="bg-white rounded-lg shadow-2xl p-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg"
                />
                <button
                  type="submit"
                  disabled={
                    !prompt.trim() ||
                    !selectedProjectId ||
                    Object.values(results).some((r) => r.isLoading)
                  }
                  className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg shadow-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard
              engine="OpenAI"
              result={results.OpenAI.result}
              isLoading={results.OpenAI.isLoading}
              error={results.OpenAI.error}
            />
            <ResultCard
              engine="Anthropic"
              result={results.Anthropic.result}
              isLoading={results.Anthropic.isLoading}
              error={results.Anthropic.error}
            />
            <ResultCard
              engine="Google"
              result={results.Google.result}
              isLoading={results.Google.isLoading}
              error={results.Google.error}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

