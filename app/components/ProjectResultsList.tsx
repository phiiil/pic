'use client'

import { useState, useEffect } from 'react'

interface AIResult {
  id: number
  step_id: number
  prompt: string
  engine: string
  response: string
  metadata: string | null
  created_at: string
}

interface Step {
  id: number
  project_id: number
  name: string
  order_index: number
  created_at: string
}

interface GroupedResult {
  prompt: string
  results: AIResult[]
  timestamp: string
}

interface StepGroup {
  step: Step
  promptGroups: GroupedResult[]
}

interface ProjectResultsListProps {
  projectId: number | null
}

export default function ProjectResultsList({ projectId }: ProjectResultsListProps) {
  const [stepGroups, setStepGroups] = useState<StepGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (projectId) {
      loadResults()
    } else {
      setStepGroups([])
      setExpandedSteps(new Set())
    }
  }, [projectId])

  const loadResults = async () => {
    if (!projectId) return

    setIsLoading(true)
    try {
      // Fetch both steps and results
      const [stepsResponse, resultsResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}/steps`),
        fetch(`/api/results?project_id=${projectId}`),
      ])

      const stepsData = await stepsResponse.json()
      const resultsData = await resultsResponse.json()

      if (stepsResponse.ok && resultsResponse.ok) {
        const steps: Step[] = stepsData.steps
        const results: AIResult[] = resultsData.results

        // Group results by step_id, then by prompt within each step
        const stepGroupsMap = new Map<number, { step: Step; results: AIResult[] }>()

        // Initialize step groups
        steps.forEach((step) => {
          stepGroupsMap.set(step.id, { step, results: [] })
        })

        // Add results to their respective steps
        results.forEach((result) => {
          const stepGroup = stepGroupsMap.get(result.step_id)
          if (stepGroup) {
            stepGroup.results.push(result)
          }
        })

        // Convert to array and organize by prompt within each step
        const organized: StepGroup[] = Array.from(stepGroupsMap.values())
          .filter((sg) => sg.results.length > 0) // Only include steps with results
          .map(({ step, results: stepResults }) => {
            // Group results by prompt
            const promptGroups = stepResults.reduce(
              (acc: Record<string, GroupedResult>, result: AIResult) => {
                if (!acc[result.prompt]) {
                  acc[result.prompt] = {
                    prompt: result.prompt,
                    results: [],
                    timestamp: result.created_at,
                  }
                }
                acc[result.prompt].results.push(result)
                // Use the most recent timestamp
                if (new Date(result.created_at) > new Date(acc[result.prompt].timestamp)) {
                  acc[result.prompt].timestamp = result.created_at
                }
                return acc
              },
              {}
            )

            // Sort prompt groups by timestamp (most recent first)
            const sortedPrompts = (Object.values(promptGroups) as GroupedResult[]).sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )

            return {
              step,
              promptGroups: sortedPrompts,
            }
          })
          .sort((a, b) => a.step.order_index - b.step.order_index) // Sort steps by order_index

        setStepGroups(organized)

        // Auto-expand steps that have results
        const stepsWithResults = new Set(organized.map((sg) => sg.step.id))
        setExpandedSteps(stepsWithResults)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStep = (stepId: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEngineIcon = (engine: string) => {
    switch (engine.toLowerCase()) {
      case 'openai':
        return '🤖'
      case 'anthropic':
        return '🧠'
      case 'google':
        return '💎'
      default:
        return '⚡'
    }
  }

  if (!projectId) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
        Project Results
      </h2>

      {isLoading ? (
        <div className="text-white/70 text-center py-8">Loading results...</div>
      ) : stepGroups.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-white/70 text-center">
            No results yet. Select a step to submit prompts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stepGroups.map((stepGroup) => {
            const isExpanded = expandedSteps.has(stepGroup.step.id)
            const resultCount = stepGroup.promptGroups.reduce(
              (sum, pg) => sum + pg.results.length,
              0
            )

            return (
              <div
                key={stepGroup.step.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
              >
                <button
                  onClick={() => toggleStep(stepGroup.step.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white capitalize">
                      {stepGroup.step.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      {resultCount}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'transform rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    {stepGroup.promptGroups.map((promptGroup, index) => (
                      <div
                        key={`${promptGroup.prompt}-${index}`}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="mb-3">
                          <h4 className="text-base font-semibold text-white mb-1">
                            {promptGroup.prompt}
                          </h4>
                          <p className="text-xs text-white/60">
                            {formatDate(promptGroup.timestamp)}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {promptGroup.results.map((result) => (
                            <div
                              key={result.id}
                              className="bg-white/5 rounded-lg p-3 border border-white/10"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getEngineIcon(result.engine)}</span>
                                <span className="font-semibold text-white text-sm">
                                  {result.engine}
                                </span>
                              </div>
                              <p className="text-white/80 text-sm line-clamp-3">
                                {result.response}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
