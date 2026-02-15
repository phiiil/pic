'use client'

import { useState } from 'react'
import ResultCard from './ResultCard'

interface EngineResult {
    result: string | null
    isLoading: boolean
    error: string | null
}

interface PromptWithResultsProps {
    stepId: number | null
    onSubmissionComplete?: () => void
}

export default function PromptWithResults({ stepId, onSubmissionComplete }: PromptWithResultsProps) {
    const [prompt, setPrompt] = useState('')
    const [results, setResults] = useState<Record<string, EngineResult>>({
        OpenAI: { result: null, isLoading: false, error: null },
        Anthropic: { result: null, isLoading: false, error: null },
        Google: { result: null, isLoading: false, error: null },
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!prompt.trim()) {
            return
        }

        if (!stepId) {
            alert('No step available for this project')
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

        const promises = engines.map(async ({ name, endpoint }) => {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt, step_id: stepId }),
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
                    return false
                }

                setResults((prev) => ({
                    ...prev,
                    [name]: {
                        result: data.response,
                        isLoading: false,
                        error: null,
                    },
                }))
                return true
            } catch (error: any) {
                setResults((prev) => ({
                    ...prev,
                    [name]: {
                        result: null,
                        isLoading: false,
                        error: error.message || 'Failed to fetch response',
                    },
                }))
                return false
            }
        })

        // Wait for all requests to complete, then notify parent
        Promise.all(promises).then(() => {
            // Clear the prompt and notify parent component
            setPrompt('')
            if (onSubmissionComplete) {
                onSubmissionComplete()
            }
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-12">
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                            className="flex-1 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-lg text-white placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={
                                !prompt.trim() ||
                                !stepId ||
                                Object.values(results).some((r) => r.isLoading)
                            }
                            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-lg shadow-lg"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        </>
    )
}

