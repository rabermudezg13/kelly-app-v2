import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeStep, completeInfoSession, getInfoSession } from '../services/api'
import type { InfoSessionWithSteps } from '../types'

interface Props {
  sessionData: InfoSessionWithSteps
  onSessionCompleted?: () => void
}

function InfoSessionWelcome({ sessionData, onSessionCompleted }: Props) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState(sessionData.steps)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentSessionData, setCurrentSessionData] = useState(sessionData)
  const [showQuestions, setShowQuestions] = useState(false)
  const [questions, setQuestions] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  })

  // Sync with backend periodically to get latest state
  useEffect(() => {
    const syncSession = async () => {
      try {
        const latest = await getInfoSession(sessionData.id)
        setCurrentSessionData(latest)
        setSteps(latest.steps)

        // Check if session was completed
        if (latest.status === 'completed' && !isCompleted) {
          setIsCompleted(true)
          setShowQuestions(true)
          if (onSessionCompleted) {
            onSessionCompleted()
          }
        }
      } catch (error) {
        console.error('Error syncing session:', error)
      }
    }

    // Sync immediately
    syncSession()

    // Sync every 5 seconds
    const interval = setInterval(syncSession, 5000)

    return () => clearInterval(interval)
  }, [sessionData.id, isCompleted, onSessionCompleted])

  useEffect(() => {
    const allCompleted = steps.every(step => step.is_completed)
    setAllStepsCompleted(allCompleted)
  }, [steps])

  const handleStepComplete = async (stepName: string) => {
    try {
      await completeStep(sessionData.id, stepName)
      
      // Update local state
      const updatedSteps = steps.map(step => 
        step.step_name === stepName 
          ? { ...step, is_completed: true }
          : step
      )
      setSteps(updatedSteps)
      
      // Sync with backend to get latest state
      const latest = await getInfoSession(sessionData.id)
      setCurrentSessionData(latest)
      setSteps(latest.steps)
    } catch (error) {
      console.error('Error completing step:', error)
      alert('Error completing step. Please try again.')
    }
  }

  const finishSession = async () => {
    if (isCompleting || isCompleted) return

    setIsCompleting(true)

    try {
      const response = await completeInfoSession(sessionData.id)
      setIsCompleted(true)
      alert('Session completed successfully!')

      if (onSessionCompleted) {
        onSessionCompleted()
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error completing session')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            Welcome to Kelly Education Miami Dade
          </h1>

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 mb-4">
              For our process you must be able to communicate in English, have your Education Proof. 
              If your Education Proof is not from the U.S., you must have the equivalence. 
              If you don't have it, our representatives will inform you how to do it.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Two Forms of Government ID</strong> such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Driver's License</li>
              <li>Social Security Card</li>
              <li>U.S. Passport</li>
              <li>Birth Certificate</li>
              <li>Permanent Resident Card</li>
              <li>Work Permit Card</li>
            </ul>
            <p className="text-gray-700 mt-4 font-semibold">
              Documents must be physical originals, not copies, and must not be expired.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Follow the steps below and check each step as you complete each stage:
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={`${step.step_name}-${index}`}
                  className={`p-6 rounded-lg border-2 ${
                    step.is_completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id={`step-${index}`}
                      checked={step.is_completed}
                      onChange={(e) => {
                        e.preventDefault()
                        if (!step.is_completed) {
                          handleStepComplete(step.step_name)
                        }
                      }}
                      className="mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={step.is_completed}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        Step {index + 1}: {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-gray-700 mb-2">{step.step_description}</p>
                      <p className="text-sm text-gray-600 italic">
                        By checking this box, I confirm that I have read and understood this section.
                      </p>
                    </div>
                    {step.is_completed && (
                      <span className="text-green-600 font-bold">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allStepsCompleted && !isCompleted && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsCompleting(true)
                  completeInfoSession(sessionData.id)
                    .then(() => {
                      setIsCompleted(true)
                      setShowQuestions(true)
                      alert('Session completed! Please answer the questions below.')
                    })
                    .catch((err) => {
                      console.error(err)
                      alert('Error: ' + (err.message || 'Unknown error'))
                      setIsCompleting(false)
                    })
                }}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl disabled:opacity-50"
              >
                {isCompleting ? 'Wait...' : 'COMPLETE SESSION'}
              </button>
            </div>
          )}


          {showQuestions && (
            <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-blue-900">Please Answer These Questions:</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    1. Tell me about a time where you were asked to sub for another instructor or were asked to fill in for someone and the instructions were either missing or illegible. What did you do in this situation? What was the outcome? Would you handle this situation differently and why?
                  </label>
                  <textarea
                    value={questions.q1}
                    onChange={(e) => setQuestions({...questions, q1: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your answer..."
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    2. Tell me about a time when you lost order or control either in a classroom or similar environment. What did you do to regain the students' or group's attention? What was the outcome of your efforts? How would you handle this situation differently based on the outcome and why?
                  </label>
                  <textarea
                    value={questions.q2}
                    onChange={(e) => setQuestions({...questions, q2: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your answer..."
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    3. What would you do if you had warned a student about his/her behavior and the student continued to misbehave?
                  </label>
                  <textarea
                    value={questions.q3}
                    onChange={(e) => setQuestions({...questions, q3: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your answer..."
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    4. If you disagreed with the policies or procedures of the school/school district/Center in which you were working, what would you do?
                  </label>
                  <textarea
                    value={questions.q4}
                    onChange={(e) => setQuestions({...questions, q4: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your answer..."
                  />
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      alert('Questions submitted! Thank you.')
                      setShowQuestions(false)
                      if (onSessionCompleted) onSessionCompleted()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSessionWelcome


