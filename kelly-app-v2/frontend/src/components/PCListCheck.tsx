import React, { useState } from 'react'
import { searchPCList, searchPCListBulk } from '../services/api'
import type { PCListBulkSearchItem, PCListMatch } from '../services/api'

function PCListCheck() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [found, setFound] = useState(false)
  const [matches, setMatches] = useState<PCListMatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [bulkNames, setBulkNames] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSearched, setBulkSearched] = useState(false)
  const [bulkResults, setBulkResults] = useState<PCListBulkSearchItem[]>([])
  const [bulkError, setBulkError] = useState<string | null>(null)

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

  const parseBulkNames = (value: string) => value
    .split(/[\r\n\t;]+/)
    .map(name => {
      const trimmed = name.trim()
      if (!trimmed.includes(",")) return trimmed
      const [lastNamePart, ...firstNameParts] = trimmed.split(",")
      return (firstNameParts.join(" ").trim() + " " + lastNamePart.trim()).trim()
    })
    .filter(Boolean)

  const handleBulkSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const names = parseBulkNames(bulkNames)
    if (names.length === 0) return
    if (names.length > 500) {
      setBulkError("You can check a maximum of 500 names at once.")
      return
    }
    setBulkLoading(true)
    setBulkError(null)
    try {
      setBulkResults(await searchPCListBulk(names))
      setBulkSearched(true)
    } catch {
      setBulkError("Error querying the PC list. Please try again.")
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkReset = () => {
    setBulkNames("")
    setBulkResults([])
    setBulkSearched(false)
    setBulkError(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
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

      <form onSubmit={handleBulkSearch} className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Check Multiple Names</h3>
          <p className="text-sm text-gray-500">
            Paste a row or column from Excel, or enter one full name per line. Maximum 500 names.
          </p>
        </div>
        <label htmlFor="pc-list-bulk-names" className="block text-sm font-semibold text-gray-700 mb-1">
          Full Names
        </label>
        <textarea
          id="pc-list-bulk-names"
          value={bulkNames}
          onChange={e => setBulkNames(e.target.value)}
          rows={7}
          placeholder={"JANE DOE\nJOHN SMITH\nGARCIA, MARIA"}
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">{parseBulkNames(bulkNames).length} name(s) ready to check</p>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={bulkLoading || parseBulkNames(bulkNames).length === 0}
            className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
          >
            {bulkLoading ? "Checking..." : "Check All Names"}
          </button>
          {bulkSearched && (
            <button
              type="button"
              onClick={handleBulkReset}
              className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {bulkError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{bulkError}</div>
      )}

      {bulkSearched && !bulkError && (
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 py-3">
            <h3 className="font-bold text-gray-800">Bulk Results</h3>
            <div className="flex gap-2 text-sm font-semibold">
              <span className="rounded bg-red-100 px-2 py-1 text-red-800">
                PC/RR: {bulkResults.filter(result => result.found).length}
              </span>
              <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                Not found: {bulkResults.filter(result => !result.found).length}
              </span>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase text-gray-600">Result</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase text-gray-600">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bulkResults.map(result => (
                  <tr key={result.name} className={result.found ? "bg-red-50" : "bg-green-50"}>
                    <td className="px-4 py-2 font-semibold text-gray-900">{result.name}</td>
                    <td className="px-4 py-2">
                      {result.found ? (
                        <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">⚠️ PC/RR</span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800">✓ Not found</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{result.matches.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
