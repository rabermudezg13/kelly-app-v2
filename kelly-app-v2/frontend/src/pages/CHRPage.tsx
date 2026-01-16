import React, { useState, useEffect } from 'react'
import {
  getCHRCases,
  createCHRCase,
  updateCHRCase,
  deleteCHRCase,
  getCHRDashboardStats,
  getCHRStatusBreakdown
} from '../services/api'
import type { CHRCase, CHRDashboardStats, CHRStatusBreakdown } from '../types'

function CHRPage() {
  const [cases, setCases] = useState<CHRCase[]>([])
  const [stats, setStats] = useState<CHRDashboardStats | null>(null)
  const [statusBreakdown, setStatusBreakdown] = useState<CHRStatusBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCase, setEditingCase] = useState<CHRCase | null>(null)
  const [formData, setFormData] = useState({
    candidate_full_name: '',
    bullhorn_id: '',
    ssn: '',
    dob: '',
    info_requested_sent_date: '',
    submitted_to_district: '',
    submission_date: '',
    district_notified: '',
    current_status: '',
    final_decision: '',
    notes: ''
  })

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found, redirecting to login')
      window.location.href = '/staff/login'
      return
    }
    loadData()
  }, [])

  // Reload data when form is closed (in case a case was created/updated)
  useEffect(() => {
    if (!showForm && !loading) {
      // Small delay to ensure backend has processed the request
      const timer = setTimeout(() => {
        loadData()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showForm])

  const loadData = async () => {
    try {
      setLoading(true)
      const [casesData, statsData, breakdownData] = await Promise.all([
        getCHRCases(),
        getCHRDashboardStats(),
        getCHRStatusBreakdown()
      ])
      setCases(casesData)
      setStats(statsData)
      setStatusBreakdown(breakdownData)
    } catch (error: any) {
      console.error('Error loading CHR data:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      // Don't show alert for 401 (unauthorized) - redirect to login instead
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/staff/login'
        return
      }
      // Only show alert for other errors
      if (error.response?.status !== 401) {
        alert(`Error loading CHR data: ${error.response?.data?.detail || error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert empty strings to null for optional fields
      const submitData = {
        candidate_full_name: formData.candidate_full_name,
        bullhorn_id: formData.bullhorn_id || null,
        ssn: formData.ssn || null,
        dob: formData.dob || null,
        info_requested_sent_date: formData.info_requested_sent_date || null,
        submitted_to_district: formData.submitted_to_district || null,
        submission_date: formData.submission_date || null,
        district_notified: formData.district_notified || null,
        current_status: formData.current_status || null,
        final_decision: formData.final_decision || null,
        notes: formData.notes || null,
      }
      
      if (editingCase) {
        await updateCHRCase(editingCase.id, submitData)
        alert('Case updated successfully!')
      } else {
        const newCase = await createCHRCase(submitData)
        console.log('Case created:', newCase)
        alert('Case created successfully!')
      }
      setShowForm(false)
      setEditingCase(null)
      resetForm()
      // Reload data after a short delay to ensure backend has processed
      setTimeout(() => {
        loadData()
      }, 500)
    } catch (error: any) {
      console.error('Error saving CHR case:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)
      alert(`Error saving case: ${error.response?.data?.detail || error.message || 'Unknown error'}`)
    }
  }

  const handleEdit = (chrCase: CHRCase) => {
    setEditingCase(chrCase)
    setFormData({
      candidate_full_name: chrCase.candidate_full_name || '',
      bullhorn_id: chrCase.bullhorn_id || '',
      ssn: chrCase.ssn || '',
      dob: chrCase.dob || '',
      info_requested_sent_date: chrCase.info_requested_sent_date || '',
      submitted_to_district: chrCase.submitted_to_district || '',
      submission_date: chrCase.submission_date || '',
      district_notified: chrCase.district_notified || '',
      current_status: chrCase.current_status || '',
      final_decision: chrCase.final_decision || '',
      notes: chrCase.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this case?')) return
    try {
      await deleteCHRCase(id)
      loadData()
    } catch (error) {
      console.error('Error deleting CHR case:', error)
      alert('Error deleting case. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      candidate_full_name: '',
      bullhorn_id: '',
      ssn: '',
      dob: '',
      info_requested_sent_date: '',
      submitted_to_district: '',
      submission_date: '',
      district_notified: '',
      current_status: '',
      final_decision: '',
      notes: ''
    })
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'waiting_documents':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'not_approved':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (deadline: string | null | undefined, finalDecision: string | null | undefined) => {
    if (!deadline || finalDecision && ['approved', 'rejected', 'not_approved'].includes(finalDecision)) {
      return false
    }
    return new Date(deadline) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading CHR data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CHR (Candidate Hiring Request)</h1>
        <button
          onClick={() => {
            setEditingCase(null)
            resetForm()
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Add New Case
        </button>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Cases</div>
            <div className="text-2xl font-bold">{stats.total_cases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Open Cases</div>
            <div className="text-2xl font-bold text-blue-600">{stats.open_cases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Denied</div>
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending Decision</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_decision}</div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {statusBreakdown && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Case by Current Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-600">Waiting Documents</div>
              <div className="text-2xl font-bold">{statusBreakdown.waiting_documents}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">In Review</div>
              <div className="text-2xl font-bold">{statusBreakdown.in_review}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">{statusBreakdown.approved}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{statusBreakdown.rejected}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Not Approved</div>
              <div className="text-2xl font-bold text-red-600">{statusBreakdown.not_approved}</div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCase ? 'Edit CHR Case' : 'Add New CHR Case'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.candidate_full_name}
                    onChange={(e) => setFormData({ ...formData, candidate_full_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bullhorn ID</label>
                  <input
                    type="text"
                    value={formData.bullhorn_id}
                    onChange={(e) => setFormData({ ...formData, bullhorn_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SSN</label>
                  <input
                    type="text"
                    value={formData.ssn}
                    onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="XXX-XX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Info Requested Letter Sent Date</label>
                  <input
                    type="date"
                    value={formData.info_requested_sent_date}
                    onChange={(e) => setFormData({ ...formData, info_requested_sent_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Submitted to District</label>
                  <select
                    value={formData.submitted_to_district}
                    onChange={(e) => setFormData({ ...formData, submitted_to_district: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={formData.submission_date}
                    onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">District Notified</label>
                  <select
                    value={formData.district_notified}
                    onChange={(e) => setFormData({ ...formData, district_notified: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Status</label>
                  <select
                    value={formData.current_status}
                    onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value="waiting_documents">Waiting Documents</option>
                    <option value="in_review">In Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Final Decision</label>
                  <select
                    value={formData.final_decision}
                    onChange={(e) => setFormData({ ...formData, final_decision: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_approved">Not Approved</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingCase ? 'Update' : 'Create'} Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCase(null)
                    resetForm()
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Candidate Name</th>
              <th className="px-4 py-2 text-left">Bullhorn ID</th>
              <th className="px-4 py-2 text-left">SSN</th>
              <th className="px-4 py-2 text-left">DOB</th>
              <th className="px-4 py-2 text-left">Info Requested Sent</th>
              <th className="px-4 py-2 text-left">Deadline</th>
              <th className="px-4 py-2 text-left">Submitted to District</th>
              <th className="px-4 py-2 text-left">Submission Date</th>
              <th className="px-4 py-2 text-left">District Notified</th>
              <th className="px-4 py-2 text-left">Current Status</th>
              <th className="px-4 py-2 text-left">Final Decision</th>
              <th className="px-4 py-2 text-left">Days Since Review</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((chrCase) => (
              <tr
                key={chrCase.id}
                className={`border-b hover:bg-gray-50 ${
                  isOverdue(chrCase.deadline, chrCase.final_decision) ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-4 py-2">{chrCase.candidate_full_name}</td>
                <td className="px-4 py-2">{chrCase.bullhorn_id || 'N/A'}</td>
                <td className="px-4 py-2">{chrCase.ssn || 'N/A'}</td>
                <td className="px-4 py-2">{formatDate(chrCase.dob)}</td>
                <td className="px-4 py-2">{formatDate(chrCase.info_requested_sent_date)}</td>
                <td className={`px-4 py-2 ${
                  isOverdue(chrCase.deadline, chrCase.final_decision) ? 'text-red-600 font-bold' : ''
                }`}>
                  {formatDate(chrCase.deadline)}
                </td>
                <td className="px-4 py-2 capitalize">{chrCase.submitted_to_district || 'N/A'}</td>
                <td className="px-4 py-2">{formatDate(chrCase.submission_date)}</td>
                <td className="px-4 py-2 capitalize">{chrCase.district_notified || 'N/A'}</td>
                <td className="px-4 py-2">
                  {chrCase.current_status && (
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(chrCase.current_status)}`}>
                      {chrCase.current_status.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {chrCase.final_decision && (
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(chrCase.final_decision)}`}>
                      {chrCase.final_decision.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{chrCase.days_since_review || 0}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(chrCase)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chrCase.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cases.length === 0 && (
          <div className="text-center py-8 text-gray-500">No CHR cases found</div>
        )}
      </div>
    </div>
  )
}

export default CHRPage
