'use client'

interface ResultCardProps {
  engine: string
  result: string | null
  isLoading: boolean
  error: string | null
}

export default function ResultCard({ engine, result, isLoading, error }: ResultCardProps) {
  const getEngineColor = (engine: string) => {
    switch (engine.toLowerCase()) {
      case 'openai':
        return 'border-green-500 bg-gray-800/50'
      case 'anthropic':
        return 'border-purple-500 bg-gray-800/50'
      case 'google':
        return 'border-blue-500 bg-gray-800/50'
      default:
        return 'border-gray-500 bg-gray-800/50'
    }
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

  return (
    <div
      className={`border-2 rounded-lg p-6 shadow-lg transition-all duration-300 ${getEngineColor(
        engine
      )} ${isLoading ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{getEngineIcon(engine)}</span>
        <h2 className="text-2xl font-bold text-white">{engine}</h2>
        {isLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="min-h-[200px]">
        {isLoading && !error && (
          <div className="text-gray-400 italic">Waiting for response...</div>
        )}
        {error && (
          <div className="text-red-400 font-semibold">
            Error: {error}
          </div>
        )}
        {result && !isLoading && (
          <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        )}
        {!isLoading && !error && !result && (
          <div className="text-gray-400 italic">No response yet</div>
        )}
      </div>
    </div>
  )
}

