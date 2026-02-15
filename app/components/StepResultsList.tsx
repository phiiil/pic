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

interface GroupedResult {
  prompt: string
  results: AIResult[]
  timestamp: string
}

interface StepResultsListProps {
  stepId: number | null
}

export default function StepResultsList({ stepId }: StepResultsListProps) {
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (stepId) {
      loadResults()
    } else {
      setGroupedResults([])
    }
  }, [stepId])

  const loadResults = async () => {
    if (!stepId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/results?step_id=${stepId}`)
      const data = await response.json()

      if (response.ok) {
        // Group results by prompt
        const grouped = data.results.reduce((acc: Record<string, GroupedResult>, result: AIResult) => {
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
        }, {})

        // Convert to array and sort by timestamp (most recent first)
        const sorted = (Object.values(grouped) as GroupedResult[]).sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setGroupedResults(sorted)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setIsLoading(false)
    }
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

  if (!stepId) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
        Previous Results
      </h2>

      {isLoading ? (
        <div className="text-white/70 text-center py-8">Loading results...</div>
      ) : groupedResults.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-white/70 text-center">
            No results yet. Submit a prompt to see results here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedResults.map((group, index) => (
            <div
              key={`${group.prompt}-${index}`}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {group.prompt}
                </h3>
                <p className="text-xs text-white/60">
                  {formatDate(group.timestamp)}
                </p>
              </div>

              <div className="space-y-3">
                {group.results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getEngineIcon(result.engine)}</span>
                      <span className="font-semibold text-white">{result.engine}</span>
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
}

