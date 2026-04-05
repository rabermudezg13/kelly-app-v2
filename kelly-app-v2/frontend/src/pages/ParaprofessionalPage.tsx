import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerInfoSession } from '../services/api'

type FormData = {
  first_name: string
  last_name: string
  zip_code: string
  email: string
  phone: string
}

const EMPTY_FORM: FormData = {
  first_name: '',
  last_name: '',
  zip_code: '',
  email: '',
  phone: '',
}

const STORAGE_KEY = 'kelly_paraprofessional_data'

function ParaprofessionalPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'waiting'>('form')
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.zip_code || !formData.email || !formData.phone) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await registerInfoSession({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        zip_code: formData.zip_code,
        session_type: 'paraprofessional',
        time_slot: 'N/A',
      })
      setSessionId(result.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: result.id, ...formData }))
      setStep('waiting')
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message
      setError(detail || 'Error registering. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-green-700 mb-4">You are registered!</h2>

          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-6 mb-8">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-2xl font-bold text-yellow-800 leading-snug">
              Please do <span className="underline">NOT</span> close this window
            </p>
            <p className="text-xl font-semibold text-yellow-700 mt-3 leading-relaxed">
              Do not answer the questions until the info session is over and you are told you can start filling out the questions.
            </p>
          </div>

          <button
            onClick={() => navigate(`/info-session/${sessionId}/questions`)}
            className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-xl transition-colors shadow-lg"
          >
            Go to Questions →
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-gray-400 hover:text-gray-600 text-sm underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-3xl font-bold text-gray-800">Paraprofessionals</h1>
            <p className="text-gray-500 mt-1">Please fill in your information to register</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Zip Code *</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Zip Code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Registering...' : 'Register Visit'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm underline">
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParaprofessionalPage
