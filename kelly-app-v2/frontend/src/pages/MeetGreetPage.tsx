import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerMeetGreet } from '../services/api'
import type { MeetGreetRegistration } from '../types'

function MeetGreetPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<MeetGreetRegistration>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    inquiry_type: '' as any,
    inquiry_detail: '',
    subparty_suggestion: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  const inquiryTypes = [
    { value: 'payroll', label: 'Payroll Question / Inquiry' },
    { value: 'frontline', label: 'Frontline Help / Assistance' },
    { value: 'other', label: 'Other Kelly Process' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.inquiry_type) {
      setError('Please select an inquiry type')
      return
    }
    setLoading(true)
    setError(null)

    try {
      await registerMeetGreet(formData)
      setRegistered(true)
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Error registering')
    } finally {
      setLoading(false)
    }
  }

  const inquiryTypeLabels: Record<string, string> = {
    payroll: 'Payroll Question / Inquiry',
    frontline: 'Frontline Help / Assistance',
    other: 'Other Kelly Process',
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤝</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Registration Successful!
              </h1>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-lg">
              <div className="text-center">
                <p className="text-xl text-gray-800 font-semibold mb-2">
                  Thank you, {formData.first_name}!
                </p>
                <p className="text-lg text-gray-700">
                  You have been registered for the Meet and Greet Feb 2026.
                </p>
                <p className="text-gray-600 mt-2">
                  A team member will assist you shortly with your inquiry.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Registration Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-800">{formData.first_name} {formData.last_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-800">{formData.email}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-800">{formData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Inquiry Type:</span>
                  <span className="text-gray-800">{inquiryTypeLabels[formData.inquiry_type] || formData.inquiry_type}</span>
                </div>
                {formData.inquiry_detail && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600 font-medium">Detail:</span>
                    <span className="text-gray-800 max-w-xs text-right">{formData.inquiry_detail}</span>
                  </div>
                )}
                {formData.subparty_suggestion && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600 font-medium">Sub Party 2026 Suggestion:</span>
                    <span className="text-gray-800 max-w-xs text-right">{formData.subparty_suggestion}</span>
                  </div>
                )}
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
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
            🤝 Meet and Greet Feb 2026
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Please fill out the form below to register
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your question or inquiry about? *
              </label>
              <div className="space-y-2">
                {inquiryTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.inquiry_type === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="inquiry_type"
                      value={type.value}
                      checked={formData.inquiry_type === type.value}
                      onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value as any })}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-800 font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please describe your question or inquiry
              </label>
              <textarea
                value={formData.inquiry_detail}
                onChange={(e) => setFormData({ ...formData, inquiry_detail: e.target.value })}
                rows={4}
                placeholder="Describe your question or inquiry here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What would you like to see at the Sub Party 2026?
              </label>
              <textarea
                value={formData.subparty_suggestion}
                onChange={(e) => setFormData({ ...formData, subparty_suggestion: e.target.value })}
                rows={3}
                placeholder="Share your ideas or suggestions for the Sub Party 2026..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register'}
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

export default MeetGreetPage
