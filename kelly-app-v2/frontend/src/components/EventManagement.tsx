import { useState, useEffect } from 'react'
import {
  createEvent,
  getEvents,
  updateEvent,
  toggleEventActive,
  deleteEvent,
  getEventAttendees,
  updateAttendee,
  bulkUpdateAttendees,
  removeDuplicates,
  getRecruiterLists,
  deleteAttendee,
  getRecruiters,
} from '../services/api'
import type { Event, EventAttendee, Recruiter, RecruiterList } from '../types'

function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [recruiterLists, setRecruiterLists] = useState<RecruiterList[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showRecruiterListsModal, setShowRecruiterListsModal] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [editEventName, setEditEventName] = useState('')
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([])
  const [assignRecruiterMode, setAssignRecruiterMode] = useState(false)
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadAttendees(selectedEvent.id)
    }
  }, [selectedEvent])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsData, recruitersData] = await Promise.all([
        getEvents(),
        getRecruiters(),
      ])
      setEvents(eventsData)
      setRecruiters(recruitersData.filter(r => r.is_active))
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const loadAttendees = async (eventId: number) => {
    try {
      const data = await getEventAttendees(eventId)
      setAttendees(data)
      setSelectedAttendees([])
    } catch (error) {
      console.error('Error loading attendees:', error)
      alert('Error loading attendees')
    }
  }

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) {
      alert('Please enter an event name')
      return
    }

    try {
      await createEvent(newEventName)
      setNewEventName('')
      setShowCreateModal(false)
      await loadData()
      alert('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Error creating event')
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !editEventName.trim()) {
      return
    }

    try {
      await updateEvent(selectedEvent.id, editEventName)
      setShowEditModal(false)
      await loadData()
      if (selectedEvent) {
        const updated = events.find(e => e.id === selectedEvent.id)
        if (updated) setSelectedEvent(updated)
      }
      alert('Event name updated!')
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Error updating event')
    }
  }

  const handleToggleActive = async (event: Event) => {
    try {
      await toggleEventActive(event.id)
      await loadData()
      if (selectedEvent && selectedEvent.id === event.id) {
        const updated = events.find(e => e.id === event.id)
        if (updated) setSelectedEvent(updated)
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('Error updating status')
    }
  }

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.name}"? This will delete all attendees and cannot be undone.`)) {
      return
    }

    try {
      await deleteEvent(event.id)
      if (selectedEvent && selectedEvent.id === event.id) {
        setSelectedEvent(null)
        setAttendees([])
      }
      await loadData()
      alert('Event deleted successfully!')
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event')
    }
  }

  const handleToggleAttendee = (attendeeId: number) => {
    setSelectedAttendees(prev =>
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    )
  }

  const handleToggleAll = () => {
    if (selectedAttendees.length === attendees.length) {
      setSelectedAttendees([])
    } else {
      setSelectedAttendees(attendees.map(a => a.id))
    }
  }

  const handleMarkAsDuplicate = async (attendeeId: number) => {
    try {
      await updateAttendee(attendeeId, { is_duplicate: true })
      if (selectedEvent) {
        await loadAttendees(selectedEvent.id)
      }
    } catch (error) {
      console.error('Error marking as duplicate:', error)
      alert('Error marking as duplicate')
    }
  }

  const handleRemoveDuplicates = async () => {
    if (!selectedEvent) return

    const duplicateCount = attendees.filter(a => a.is_duplicate).length
    if (duplicateCount === 0) {
      alert('No duplicates to remove')
      return
    }

    if (!confirm(`Remove ${duplicateCount} duplicate attendees? This action cannot be undone.`)) {
      return
    }

    try {
      await removeDuplicates(selectedEvent.id)
      await loadAttendees(selectedEvent.id)
      alert('Duplicates removed successfully')
    } catch (error) {
      console.error('Error removing duplicates:', error)
      alert('Error removing duplicates')
    }
  }

  const handleAssignRecruiter = async () => {
    if (selectedAttendees.length === 0) {
      alert('Please select at least one attendee')
      return
    }

    if (!selectedRecruiterId) {
      alert('Please select a recruiter')
      return
    }

    try {
      await bulkUpdateAttendees(selectedAttendees, {
        assigned_recruiter_id: selectedRecruiterId,
        is_checked: true,
      })

      if (selectedEvent) {
        await loadAttendees(selectedEvent.id)
      }

      setSelectedAttendees([])
      setAssignRecruiterMode(false)
      setSelectedRecruiterId(null)
      alert('Recruiter assigned successfully')
    } catch (error) {
      console.error('Error assigning recruiter:', error)
      alert('Error assigning recruiter')
    }
  }

  const handleViewRecruiterLists = async () => {
    if (!selectedEvent) return

    try {
      const lists = await getRecruiterLists(selectedEvent.id)
      setRecruiterLists(lists)
      setShowRecruiterListsModal(true)
    } catch (error) {
      console.error('Error loading recruiter lists:', error)
      alert('Error loading recruiter lists')
    }
  }

  const handleDeleteAttendee = async (attendeeId: number) => {
    if (!confirm('Delete this attendee? This action cannot be undone.')) {
      return
    }

    try {
      await deleteAttendee(attendeeId)
      if (selectedEvent) {
        await loadAttendees(selectedEvent.id)
      }
    } catch (error) {
      console.error('Error deleting attendee:', error)
      alert('Error deleting attendee')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Event Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Event Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          + Create New Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div
            key={event.id}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedEvent?.id === event.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  event.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {event.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Code: <span className="font-mono font-semibold">{event.unique_code}</span>
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Attendees: <span className="font-bold">{event.attendee_count || 0}</span>
            </p>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEvent(event)
                  setShowQRModal(true)
                }}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                View QR
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEvent(event)
                  setEditEventName(event.name)
                  setShowEditModal(true)
                }}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleActive(event)
                }}
                className={`flex-1 px-3 py-2 rounded text-sm ${
                  event.is_active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {event.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteEvent(event)
                }}
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Attendees Section */}
      {selectedEvent && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Attendees for "{selectedEvent.name}"
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleRemoveDuplicates}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove Duplicates
                </button>
                <button
                  onClick={() => setAssignRecruiterMode(!assignRecruiterMode)}
                  className={`px-4 py-2 rounded ${
                    assignRecruiterMode
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {assignRecruiterMode ? 'Cancel' : 'Assign Recruiters'}
                </button>
                <button
                  onClick={handleViewRecruiterLists}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View Recruiter Lists
                </button>
              </div>
            </div>

            {assignRecruiterMode && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-semibold text-blue-800 mb-2">
                  Assign Recruiter Mode
                </p>
                <p className="text-sm text-blue-700 mb-3">
                  Select attendees below and choose a recruiter to assign them
                </p>
                <div className="flex gap-3 items-center">
                  <select
                    value={selectedRecruiterId || ''}
                    onChange={(e) => setSelectedRecruiterId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select a recruiter...</option>
                    {recruiters.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignRecruiter}
                    disabled={selectedAttendees.length === 0 || !selectedRecruiterId}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign ({selectedAttendees.length})
                  </button>
                </div>
              </div>
            )}

            {attendees.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No attendees registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      {assignRecruiterMode && (
                        <th className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.length === attendees.length}
                            onChange={handleToggleAll}
                            className="w-5 h-5"
                          />
                        </th>
                      )}
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">ZIP Code</th>
                      <th className="px-4 py-2 text-left">English</th>
                      <th className="px-4 py-2 text-left">Education</th>
                      <th className="px-4 py-2 text-left">Recruiter</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee, index) => (
                      <tr
                        key={attendee.id}
                        className={`border-b ${
                          attendee.is_duplicate ? 'bg-red-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {assignRecruiterMode && (
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedAttendees.includes(attendee.id)}
                              onChange={() => handleToggleAttendee(attendee.id)}
                              className="w-5 h-5"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 font-semibold">{index + 1}</td>
                        <td className="px-4 py-2">
                          {attendee.first_name} {attendee.last_name}
                        </td>
                        <td className="px-4 py-2">{attendee.email}</td>
                        <td className="px-4 py-2">{attendee.phone}</td>
                        <td className="px-4 py-2">{attendee.zip_code}</td>
                        <td className="px-4 py-2">
                          {attendee.english_communication ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-2">
                          {attendee.education_proof ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-2">
                          {attendee.assigned_recruiter_name || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {attendee.is_duplicate ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              Duplicate
                            </span>
                          ) : attendee.is_checked ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              Checked
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                              New
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            {!attendee.is_duplicate && (
                              <button
                                onClick={() => handleMarkAsDuplicate(attendee.id)}
                                className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                              >
                                Mark Duplicate
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAttendee(attendee.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Create New Event</h3>
            <input
              type="text"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="Event name"
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Edit Event Name</h3>
            <input
              type="text"
              value={editEventName}
              onChange={(e) => setEditEventName(e.target.value)}
              placeholder="Event name"
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">{selectedEvent.name} - QR Code</h3>

            {selectedEvent.qr_code_data && (
              <div className="flex flex-col items-center mb-4">
                <img
                  src={selectedEvent.qr_code_data}
                  alt="Event QR Code"
                  className="w-64 h-64 border-4 border-gray-300 rounded"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/event/${selectedEvent.unique_code}/register`}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-50"
                />
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/event/${selectedEvent.unique_code}/register`
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Recruiter Lists Modal */}
      {showRecruiterListsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Recruiter Assignment Lists</h3>

            {recruiterLists.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No attendees assigned to recruiters yet
              </p>
            ) : (
              <div className="space-y-6">
                {recruiterLists.map(list => (
                  <div key={list.recruiter_id} className="border-2 border-gray-300 rounded-lg p-4">
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      {list.recruiter_name}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({list.attendees.length} attendees)
                      </span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left text-sm">#</th>
                            <th className="px-3 py-2 text-left text-sm">Name</th>
                            <th className="px-3 py-2 text-left text-sm">Email</th>
                            <th className="px-3 py-2 text-left text-sm">Phone</th>
                            <th className="px-3 py-2 text-left text-sm">ZIP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.attendees.map((attendee, index) => (
                            <tr key={attendee.id} className="border-b">
                              <td className="px-3 py-2 text-sm">{index + 1}</td>
                              <td className="px-3 py-2 text-sm">
                                {attendee.first_name} {attendee.last_name}
                              </td>
                              <td className="px-3 py-2 text-sm">{attendee.email}</td>
                              <td className="px-3 py-2 text-sm">{attendee.phone}</td>
                              <td className="px-3 py-2 text-sm">{attendee.zip_code}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={() => {
                        const text = list.attendees
                          .map((a, i) =>
                            `${i + 1}. ${a.first_name} ${a.last_name} | ${a.email} | ${a.phone} | ${a.zip_code}`
                          )
                          .join('\n')
                        copyToClipboard(`${list.recruiter_name}:\n\n${text}`)
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Copy List
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowRecruiterListsModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventManagement
