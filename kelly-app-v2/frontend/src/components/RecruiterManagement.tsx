import React, { useState, useEffect } from 'react'
import { getRecruiters, getAllRecruitersForAdmin, createRecruiter, setRecruiterActive } from '../services/api'

interface Recruiter {
  id: number
  name: string
  email: string
  is_active: boolean
  status: 'available' | 'busy'
}

interface Props {
  isAdmin?: boolean
}

function RecruiterManagement({ isAdmin = false }: Props) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = isAdmin ? await getAllRecruitersForAdmin() : await getRecruiters()
      setRecruiters(data as Recruiter[])
    } catch {
      setError('Error loading recruiters.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createRecruiter(newName.trim(), newEmail.trim())
      setSuccess('Recruiter added successfully.')
      setNewName('')
      setNewEmail('')
      setShowAddForm(false)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error adding recruiter.')
    } finally {
      setSaving(false)
    }
  }

  const handleActiveChange = async (recruiter: Recruiter) => {
    const action = recruiter.is_active ? 'deactivate' : 'reactivate'
    if (!window.confirm(`${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} ${recruiter.name}?`)) return
    try {
      setError(null)
      await setRecruiterActive(recruiter.id, !recruiter.is_active)
      setSuccess(`${recruiter.name} ${action}d successfully.`)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || `Error trying to ${action} recruiter.`)
    }
  }

  if (loading) return <p className="text-center py-8 text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recruiters</h2>
        {isAdmin && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setError(null) }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add Recruiter'}
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      {isAdmin && showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">New Recruiter</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Full name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-lg text-sm"
          >
            {saving ? 'Saving...' : 'Save Recruiter'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              {isAdmin && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {recruiters.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3} className="px-4 py-8 text-center text-gray-500">No recruiters found</td></tr>
            )}
            {recruiters.map(r => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{r.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        !r.is_active
                          ? 'bg-gray-100 text-gray-600'
                          : r.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {!r.is_active ? '● Inactive' : r.status === 'available' ? '● Available' : '● Busy'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                      <button
                        onClick={() => handleActiveChange(r)}
                        className={`px-3 py-1 text-white rounded text-xs font-semibold ${
                          r.is_active
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {r.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecruiterManagement
