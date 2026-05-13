import React, { useState } from 'react'
import { searchPCList } from '../services/api'
import type { PCListMatch } from '../services/api'

function PCListCheck() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [found, setFound] = useState(false)
  const [matches, setMatches] = useState<PCListMatch[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await searchPCList(firstName.trim(), lastName.trim())
      setFound(result.found)
      setMatches(result.matches)
      setSearched(true)
    } catch {
      setError('Error querying the PC list. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDOB = (dob: string | null | undefined) => {
    if (!dob) return 'N/A'
    try {
      return new Date(dob).toLocaleDateString('en-US', { timeZone: 'UTC' })
    } catch {
      return dob
    }
  }

  const formatSSNLast4 = (ssn: string | null | undefined) => {
    if (!ssn) return 'N/A'
    const digits = ssn.replace(/\D/g, '')
    if (digits.length >= 4) return `***-**-${digits.slice(-4)}`
    return '***-**-****'
  }

  const handleReset = () => {
    setFirstName('')
    setLastName('')
    setSearched(false)
    setFound(false)
    setMatches([])
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">PC List</h2>
        <p className="text-gray-500 text-sm">Check if an applicant appears in the PC list</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searched && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {searched && !error && (
        <div className={`rounded-xl shadow p-6 ${found ? 'bg-red-50 border-2 border-red-400' : 'bg-green-50 border-2 border-green-400'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{found ? '⛔' : '✅'}</span>
            <div>
              <p className="text-lg font-bold">
                {found
                  ? `${firstName.trim().toUpperCase()} ${lastName.trim().toUpperCase()} IS on the PC list`
                  : `${firstName.trim().toUpperCase()} ${lastName.trim().toUpperCase()} is NOT on the PC list`}
              </p>
              {found && matches.length > 1 && (
                <p className="text-sm text-red-600 mt-0.5">
                  {matches.length} records found with this name. Verify SSN and DOB.
                </p>
              )}
            </div>
          </div>

          {found && matches.map((match, idx) => (
            <div key={match.id} className={`bg-white rounded-lg p-4 border border-red-200 ${idx > 0 ? 'mt-3' : ''}`}>
              {matches.length > 1 && (
                <p className="text-xs font-bold text-red-500 uppercase mb-2">Record #{idx + 1}</p>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="ml-2 font-semibold text-gray-800">{match.name}</span>
                </div>
                {match.code && (
                  <div>
                    <span className="text-gray-500 font-medium">Code:</span>
                    <span className="ml-2 font-semibold text-gray-800">{match.code}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 font-medium">SSN (last 4):</span>
                  <span className="ml-2 font-semibold text-gray-800">{formatSSNLast4(match.ssn)}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">DOB:</span>
                  <span className="ml-2 font-semibold text-gray-800">{formatDOB(match.dob)}</span>
                </div>
                {match.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500 font-medium">Notes:</span>
                    <span className="ml-2 text-gray-800">{match.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PCListCheck
