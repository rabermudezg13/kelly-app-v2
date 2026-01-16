import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerNewHireOrientation, getNewHireOrientation } from '../services/api'
import NewHireOrientationWelcome from '../components/NewHireOrientationWelcome'
import NewHireOrientationForm from '../components/NewHireOrientationForm'
import type { NewHireOrientationRegistration, NewHireOrientationWithSteps } from '../types'

const STORAGE_KEY = 'kelly_new_hire_orientation_data'

function NewHireOrientationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'welcome'>('form')
  const [orientationData, setOrientationData] = useState<NewHireOrientationWithSteps | null>(null)
  const [loading, setLoading] = useState(true)

  // Load saved orientation on mount
  useEffect(() => {
    const loadSavedOrientation = async () => {
      try {
        const savedOrientationData = localStorage.getItem(STORAGE_KEY)
        
        if (savedOrientationData) {
          const parsed = JSON.parse(savedOrientationData)
          
          // Verify orientation still exists and get latest data from backend
          try {
            const latestOrientation = await getNewHireOrientation(parsed.id)
            
            // Only restore if orientation is not completed
            if (latestOrientation.status !== 'completed') {
              setOrientationData(latestOrientation)
              setStep('welcome')
            } else {
              // Orientation was completed, clear storage
              localStorage.removeItem(STORAGE_KEY)
            }
          } catch (error) {
            // Orientation might not exist anymore, clear storage
            console.error('Error loading saved orientation:', error)
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('Error loading saved orientation:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedOrientation()
  }, [])

  const handleSubmit = async (formData: NewHireOrientationRegistration) => {
    try {
      // Register the orientation
      const registered = await registerNewHireOrientation(formData)
      setOrientationData(registered)
      setStep('welcome')
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: registered.id,
        first_name: registered.first_name,
        last_name: registered.last_name,
        email: registered.email,
        created_at: registered.created_at
      }))
    } catch (error: any) {
      alert(`Error registering: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleOrientationCompleted = () => {
    // Clear localStorage when orientation is completed
    localStorage.removeItem(STORAGE_KEY)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-800">Loading orientation...</p>
        </div>
      </div>
    )
  }

  if (step === 'welcome' && orientationData) {
    return (
      <NewHireOrientationWelcome
        orientationData={orientationData}
        onOrientationCompleted={handleOrientationCompleted}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            New Hire Orientation Registration
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Please fill out the form below to register for New Hire Orientation
          </p>
          <NewHireOrientationForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
          />
        </div>
      </div>
    </div>
  )
}

export default NewHireOrientationPage
