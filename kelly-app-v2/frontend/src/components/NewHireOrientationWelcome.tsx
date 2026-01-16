import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeNewHireOrientationStep, completeNewHireOrientation, getNewHireOrientation } from '../services/api'
import type { NewHireOrientationWithSteps } from '../types'

interface Props {
  orientationData: NewHireOrientationWithSteps
  onOrientationCompleted?: () => void
}

function NewHireOrientationWelcome({ orientationData, onOrientationCompleted }: Props) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState(orientationData.steps)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentOrientationData, setCurrentOrientationData] = useState(orientationData)

  // Sync with backend periodically to get latest state
  useEffect(() => {
    const syncOrientation = async () => {
      try {
        const latest = await getNewHireOrientation(orientationData.id)
        setCurrentOrientationData(latest)
        setSteps(latest.steps)
        
        // Check if orientation was completed
        if (latest.status === 'completed' && !isCompleted) {
          setIsCompleted(true)
          if (onOrientationCompleted) {
            onOrientationCompleted()
          }
        }
      } catch (error) {
        console.error('Error syncing orientation:', error)
      }
    }

    // Sync immediately
    syncOrientation()
    
    // Sync every 5 seconds
    const interval = setInterval(syncOrientation, 5000)
    
    return () => clearInterval(interval)
  }, [orientationData.id, isCompleted, onOrientationCompleted])

  useEffect(() => {
    const allCompleted = steps.every(step => step.is_completed)
    setAllStepsCompleted(allCompleted)
  }, [steps])

  const handleStepComplete = async (stepName: string) => {
    try {
      await completeNewHireOrientationStep(orientationData.id, stepName)
      
      // Update local state
      const updatedSteps = steps.map(step => 
        step.step_name === stepName 
          ? { ...step, is_completed: true }
          : step
      )
      setSteps(updatedSteps)
      
      // Sync with backend to get latest state
      const latest = await getNewHireOrientation(orientationData.id)
      setCurrentOrientationData(latest)
      setSteps(latest.steps)
    } catch (error) {
      console.error('Error completing step:', error)
      alert('Error completing step. Please try again.')
    }
  }

  const handleCompleteOrientation = async () => {
    if (!allStepsCompleted) {
      alert('Please complete all steps before marking the orientation as completed.')
      return
    }

    if (isCompleting || isCompleted) {
      return
    }

    try {
      setIsCompleting(true)
      await completeNewHireOrientation(orientationData.id)
      setIsCompleted(true)
      
      if (onOrientationCompleted) {
        onOrientationCompleted()
      }
      
      alert('New Hire Orientation marked as completed!')
      
      // Sync with backend to get latest state
      const latest = await getNewHireOrientation(orientationData.id)
      setCurrentOrientationData(latest)
      setSteps(latest.steps)
    } catch (error: any) {
      console.error('Error completing orientation:', error)
      alert(`Error completing orientation: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            Welcome to New Hire Orientation
          </h1>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Please read and confirm each requirement below:
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.step_name}
                  className={`p-6 rounded-lg border-2 ${
                    step.is_completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={step.is_completed}
                      onChange={() => !step.is_completed && handleStepComplete(step.step_name)}
                      className="mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={step.is_completed}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        Step {index + 1}: {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-gray-700 mb-2">{step.step_description}</p>
                      <p className="text-sm text-gray-600 italic">
                        By checking this box, I confirm that I have read and understood this requirement.
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
            <div className="mb-6 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <p className="text-yellow-800 font-bold text-lg mb-4">
                ⚠️ Do not close this screen
              </p>
              <p className="text-yellow-700 mb-4">
                Please, once you have confirmed all requirements, click the "Register New Hire Orientation" button.
              </p>
              <div className="text-center">
                <button
                  onClick={handleCompleteOrientation}
                  disabled={isCompleting}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? 'Completing...' : 'Register New Hire Orientation'}
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="mb-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 font-bold text-lg mb-2">
                ✅ New Hire Orientation Completed
              </p>
              <p className="text-green-700 mb-2">
                Your orientation has been marked as completed.
              </p>
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

export default NewHireOrientationWelcome
