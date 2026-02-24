import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInfoSession } from '../services/api'
import InfoSessionWelcome from '../components/InfoSessionWelcome'
import type { InfoSessionWithSteps } from '../types'

function InfoSessionQuestionsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState<InfoSessionWithSteps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      try {
        const data = await getInfoSession(parseInt(sessionId))
        setSessionData(data)
      } catch (err: any) {
        setError('Session not found or has been deleted.')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-800">Loading session...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <InfoSessionWelcome sessionData={sessionData} />
}

export default InfoSessionQuestionsPage
