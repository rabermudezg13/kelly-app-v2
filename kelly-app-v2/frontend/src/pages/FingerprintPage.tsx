import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerFingerprint } from '../services/api'

function FingerprintPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    fingerprint_type: 'regular'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Set default values for required backend fields
      const fingerprintData = {
        ...formData,
        zip_code: '',
        appointment_time: '9:00 AM' // Default time
      }
      await registerFingerprint(fingerprintData)
      setRegistered(true)
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Error registering fingerprint appointment')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👆</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Fingerprint Registration Successful
              </h1>
              <p className="text-gray-600">
                Thank you for registering, {formData.first_name}!
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                📋 Important Information About Your Fingerprint Appointment
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg mb-2 text-blue-900">
                    ✅ If you have already scheduled your appointment on the Fieldprint website:
                  </h3>
                  <p className="text-gray-700">
                    Show the confirmation you received to our representatives and they will help you.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg mb-2 text-blue-900">
                    📅 If you have NOT scheduled your appointment yet:
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Please follow this link, go to "Schedule Appointment" and fill in the information. When asked, our representatives will help you with the Fieldprint code.
                  </p>
                  <a
                    href="https://fieldprintflorida.com/individuals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Go to Fieldprint Florida Website →
                  </a>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-bold text-lg mb-2 text-yellow-900">
                    ⚠️ Important Reminder:
                  </h3>
                  <p className="text-gray-700">
                    <strong>DCF and regular fingerprints have different codes and fees.</strong> Please make sure you enter the correct information.
                  </p>
                  <p className="mt-2 text-gray-700">
                    <strong>Your selected type:</strong> <span className="font-bold text-blue-600 uppercase">{formData.fingerprint_type}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            👆 Fingerprint Appointment Registration
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Please fill out the form below to register for a fingerprint appointment
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fingerprint Type *
              </label>
              <select
                required
                value={formData.fingerprint_type}
                onChange={(e) => setFormData({ ...formData, fingerprint_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="regular">Regular</option>
                <option value="dcf">DCF</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register Fingerprint Appointment'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/register-visit')}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FingerprintPage
