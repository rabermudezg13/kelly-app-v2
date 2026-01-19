import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventByCode, registerAttendee } from '../services/api'
import type { Event, EventAttendeeCreate } from '../types'

function EventRegistrationPage() {
  const { unique_code } = useParams<{ unique_code: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<EventAttendeeCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    english_communication: false,
    education_proof: false,
  })

  useEffect(() => {
    loadEvent()
  }, [unique_code])

  const loadEvent = async () => {
    if (!unique_code) {
      setError('Event code not provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const eventData = await getEventByCode(unique_code)
      setEvent(eventData)
      setError(null)
    } catch (err: any) {
      console.error('Error loading event:', err)
      setError(err.response?.data?.detail || 'Event not found or no longer active')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.zip_code) {
      alert('Please fill in all required fields')
      return
    }

    if (!formData.english_communication || !formData.education_proof) {
      alert('Please confirm both requirements before registering')
      return
    }

    try {
      setSubmitting(true)
      await registerAttendee(unique_code!, formData)
      setSuccess(true)

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        zip_code: '',
        english_communication: false,
        education_proof: false,
      })
    } catch (err: any) {
      console.error('Error registering:', err)
      alert(err.response?.data?.detail || 'Error registering. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-xl text-gray-700">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Event Not Found</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Event Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {event.name}
            </h1>
            <p className="text-gray-600">Event Registration</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-semibold">Registration Open</span>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-6 bg-green-50 border-l-4 border-green-500 rounded shadow-md">
              <p className="text-green-800 font-bold text-xl mb-3">
                ✅ Registration Successful!
              </p>
              <p className="text-green-700 text-lg mb-2">
                Thank you for registering! Your information has been successfully submitted to our system.
              </p>
              <p className="text-green-600">
                We look forward to seeing you at the event!
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(305) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="33101"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Requirements</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <input
                    type="checkbox"
                    id="english_communication"
                    name="english_communication"
                    checked={formData.english_communication}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="english_communication" className="cursor-pointer flex-1">
                    <span className="font-semibold text-gray-800 block mb-1">
                      English Communication <span className="text-red-500">*</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      I confirm that I can communicate effectively in English.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <input
                    type="checkbox"
                    id="education_proof"
                    name="education_proof"
                    checked={formData.education_proof}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="education_proof" className="cursor-pointer flex-1">
                    <span className="font-semibold text-gray-800 block mb-1">
                      Proof of Education <span className="text-red-500">*</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      I confirm that I have proof of education documentation.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? 'Registering...' : 'Register for Event'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventRegistrationPage
