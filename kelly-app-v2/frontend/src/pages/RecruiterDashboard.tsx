import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  getRecruiterStatus,
  updateRecruiterStatus,
  getAssignedSessions,
  startSession,
  completeSession,
  updateSessionDocuments,
  getLiveInfoSessions,
  getInfoSessions,
  downloadAnswersPDF,
  getRowTemplates,
  getRowTemplate,
  generateRow,
  getNewHireOrientations,
  getNewHireOrientation,
  updateNewHireOrientation,
  getFingerprints,
  getBadges,
  getMyVisits,
  notifyTeamVisit,
} from '../services/api'
import type { AssignedSession, Recruiter, NewHireOrientation, NewHireOrientationWithSteps } from '../types'
import type { RowTemplate } from '../services/api'
import { formatMiamiTime, getMiamiDateKey, formatMiamiDateDisplay } from '../utils/dateUtils'
import CHRPage from './CHRPage'
import StatisticsDashboard from './StatisticsDashboard'

type RecruiterTabType = 'sessions' | 'all-info-sessions' | 'new-hire-orientation' | 'fingerprints' | 'badges' | 'my-visits' | 'statistics' | 'chr'

function RecruiterDashboard() {
  const { recruiterId } = useParams<{ recruiterId: string }>()
  const [activeTab, setActiveTab] = useState<RecruiterTabType>('sessions')
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null)
  const [sessions, setSessions] = useState<AssignedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AssignedSession | null>(null)
  const [documentStatus, setDocumentStatus] = useState({
    ob365_sent: false,
    i9_sent: false,
    existing_i9: false,
    ineligible: false,
    rejected: false,
    drug_screen: false,
    questions: false,
  })
  const [templates, setTemplates] = useState<RowTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RowTemplate | null>(null)
  const [sessionRowData, setSessionRowData] = useState<Record<string, any>>({})
  const [sessionGeneratedRow, setSessionGeneratedRow] = useState<string>('')
  const [sessionRowCopied, setSessionRowCopied] = useState(false)
  const [newHireOrientations, setNewHireOrientations] = useState<NewHireOrientation[]>([])
  const [selectedOrientation, setSelectedOrientation] = useState<NewHireOrientationWithSteps | null>(null)
  const [fingerprints, setFingerprints] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [myVisits, setMyVisits] = useState<any[]>([])
  const [allInfoSessions, setAllInfoSessions] = useState<any[]>([])

  useEffect(() => {
    if (recruiterId) {
      loadData()
    }
  }, [recruiterId])

  const loadData = async () => {
    if (!recruiterId) return
    try {
      setLoading(true)
      // Load critical data first
      const recruiterData = await getRecruiterStatus(parseInt(recruiterId))
      setRecruiter(recruiterData as Recruiter)
      
      // Load other data in parallel, but handle errors gracefully
      let allSessionsData: any[] = []
      let templatesData: any[] = []
      let orientationsData: any[] = []
      let fingerprintsData: any[] = []
      
      try {
        // Use getAssignedSessions to get only sessions assigned to this recruiter
        const sessionsResponse = await getAssignedSessions(parseInt(recruiterId))
        if (sessionsResponse && sessionsResponse.sessions && Array.isArray(sessionsResponse.sessions)) {
          allSessionsData = sessionsResponse.sessions
        } else if (Array.isArray(sessionsResponse)) {
          // Fallback: if it's already an array, use it directly
          allSessionsData = sessionsResponse
        }
      } catch (error) {
        console.error('Error loading assigned sessions:', error)
        // Continue with empty array
      }
      
      try {
        templatesData = await getRowTemplates(true)
      } catch (error) {
        console.error('Error loading templates:', error)
        // Continue with empty array
      }
      
      try {
        orientationsData = await getNewHireOrientations()
      } catch (error) {
        console.error('Error loading orientations:', error)
        // Continue with empty array
      }
      
      try {
        fingerprintsData = await getFingerprints()
      } catch (error) {
        console.error('Error loading fingerprints:', error)
        // Continue with empty array
      }
      
      try {
        const badgesData = await getBadges()
        setBadges(badgesData)
      } catch (error) {
        console.error('Error loading badges:', error)
        // Continue with empty array
      }
      
      try {
        const visitsData = await getMyVisits()
        console.log('Loaded visits:', visitsData)
        setMyVisits(visitsData || [])
      } catch (error: any) {
        console.error('Error loading my visits:', error)
        // Show more detailed error
        if (error.response?.status === 401) {
          console.error('Authentication error - user may not be logged in')
        } else if (error.response?.status === 403) {
          console.error('Permission denied')
        } else {
          console.error('Error details:', error.response?.data || error.message)
        }
        // Continue with empty array
        setMyVisits([])
      }
      
      try {
        const allSessions = await getInfoSessions()
        setAllInfoSessions(allSessions || [])
      } catch (error) {
        console.error('Error loading all info sessions:', error)
        setAllInfoSessions([])
      }
      
      // Convert InfoSessionWithSteps to AssignedSession format
      const convertedSessions = allSessionsData.map(session => ({
        id: session.id,
        first_name: session.first_name,
        last_name: session.last_name,
        email: session.email,
        phone: session.phone,
        zip_code: session.zip_code,
        session_type: session.session_type,
        time_slot: session.time_slot,
        status: session.status,
        ob365_sent: session.ob365_sent || false,
        i9_sent: session.i9_sent || false,
        existing_i9: session.existing_i9 || false,
        ineligible: session.ineligible || false,
        rejected: session.rejected || false,
        drug_screen: session.drug_screen || false,
        questions: session.questions || false,
        started_at: session.started_at || null,
        completed_at: session.completed_at || null,
        duration_minutes: session.duration_minutes || null,
        created_at: session.created_at,
        assigned_recruiter_id: session.assigned_recruiter_id,
        assigned_recruiter_name: session.assigned_recruiter_name,
        generated_row: null, // Will be loaded separately if needed
      }))
      // Sort by created_at descending (newest first)
      convertedSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setSessions(convertedSessions)
      setTemplates(templatesData)
      
      // Set default template if available
      if (templatesData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templatesData[0])
      }
      
      setNewHireOrientations(orientationsData)
      setFingerprints(fingerprintsData)
      
      // Update selected session if it exists
      if (selectedSession) {
        const updatedSession = convertedSessions.find(s => s.id === selectedSession.id)
        if (updatedSession) {
          setSelectedSession(updatedSession)
          setDocumentStatus({
            ob365_sent: updatedSession.ob365_sent,
            i9_sent: updatedSession.i9_sent,
            existing_i9: updatedSession.existing_i9,
            ineligible: updatedSession.ineligible,
            rejected: updatedSession.rejected,
            drug_screen: updatedSession.drug_screen,
            questions: updatedSession.questions,
          })
          
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      // Don't show alert for 401 (unauthorized) - redirect to login instead
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/staff/login'
        return
      }
      // Check if backend is not running
      if (error.message?.includes('Backend server is not responding') || 
          error.message?.includes('Cannot connect to backend') ||
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNABORTED') {
        alert('No se puede conectar al servidor. Por favor, asegúrate de que el backend esté corriendo en el puerto 3026.')
        return
      }
      // Show more detailed error message
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      alert(`Error loading dashboard data: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshDataInBackground = async () => {
    if (!recruiterId) return
    try {
      setRefreshing(true)
      // Load data in background without clearing the screen
      const recruiterData = await getRecruiterStatus(parseInt(recruiterId))
      if (recruiterData) {
        setRecruiter(recruiterData as Recruiter)
      }
      
      // Use Promise.allSettled to handle individual failures gracefully
      const [sessionsResult, templatesResult, orientationsResult, fingerprintsResult, badgesResult, visitsResult, allSessionsResult] = await Promise.allSettled([
        getAssignedSessions(parseInt(recruiterId)),
        getRowTemplates(),
        getNewHireOrientations(),
        getFingerprints(),
        getBadges(),
        getMyVisits(),
        getInfoSessions()
      ])
      
      let allSessionsData: any[] = []
      if (sessionsResult.status === 'fulfilled') {
        // getAssignedSessions returns { sessions: [], count: number }
        if (sessionsResult.value && sessionsResult.value.sessions && Array.isArray(sessionsResult.value.sessions)) {
          allSessionsData = sessionsResult.value.sessions
        } else if (Array.isArray(sessionsResult.value)) {
          // Fallback: if it's already an array, use it directly
          allSessionsData = sessionsResult.value
        }
      } else {
        console.error('Error loading sessions:', sessionsResult.reason)
      }
      
      let templatesData: RowTemplate[] = []
      if (templatesResult.status === 'fulfilled' && Array.isArray(templatesResult.value)) {
        templatesData = templatesResult.value
      } else {
        console.error('Error loading templates:', templatesResult.reason)
      }
      
      let orientationsData: any[] = []
      if (orientationsResult.status === 'fulfilled' && Array.isArray(orientationsResult.value)) {
        orientationsData = orientationsResult.value
      } else {
        console.error('Error loading orientations:', orientationsResult.reason)
      }
      
      let fingerprintsData: any[] = []
      if (fingerprintsResult.status === 'fulfilled' && Array.isArray(fingerprintsResult.value)) {
        fingerprintsData = fingerprintsResult.value
      } else {
        console.error('Error loading fingerprints:', fingerprintsResult.reason)
      }
      
      if (badgesResult.status === 'fulfilled' && Array.isArray(badgesResult.value)) {
        setBadges(badgesResult.value)
      } else {
        console.error('Error loading badges:', badgesResult.reason)
      }
      
      if (visitsResult.status === 'fulfilled' && Array.isArray(visitsResult.value)) {
        setMyVisits(visitsResult.value)
      } else {
        console.error('Error loading my visits:', visitsResult.reason)
      }
      
      if (allSessionsResult.status === 'fulfilled' && Array.isArray(allSessionsResult.value)) {
        setAllInfoSessions(allSessionsResult.value)
      } else {
        console.error('Error loading all info sessions:', allSessionsResult.reason)
      }
      
      // Convert InfoSessionWithSteps to AssignedSession format
      const convertedSessions = (allSessionsData || []).map((session: any) => ({
        id: session.id,
        first_name: session.first_name,
        last_name: session.last_name,
        email: session.email,
        phone: session.phone,
        zip_code: session.zip_code,
        session_type: session.session_type,
        time_slot: session.time_slot,
        status: session.status,
        ob365_sent: session.ob365_sent || false,
        i9_sent: session.i9_sent || false,
        existing_i9: session.existing_i9 || false,
        ineligible: session.ineligible || false,
        rejected: session.rejected || false,
        drug_screen: session.drug_screen || false,
        questions: session.questions || false,
        started_at: session.started_at || null,
        completed_at: session.completed_at || null,
        duration_minutes: session.duration_minutes || null,
        assigned_recruiter_id: session.assigned_recruiter_id,
        assigned_recruiter_name: session.assigned_recruiter_name,
        generated_row: session.generated_row || null,
        created_at: session.created_at
      }))
      
      setSessions(convertedSessions)
      setTemplates(templatesData)
      setNewHireOrientations(orientationsData)
      setFingerprints(fingerprintsData)
      
      // Update selected session if it exists
      if (selectedSession) {
        const updatedSession = convertedSessions.find(s => s.id === selectedSession.id)
        if (updatedSession) {
          setSelectedSession(updatedSession)
          setDocumentStatus({
            ob365_sent: updatedSession.ob365_sent,
            i9_sent: updatedSession.i9_sent,
            existing_i9: updatedSession.existing_i9,
            ineligible: updatedSession.ineligible,
            rejected: updatedSession.rejected,
            drug_screen: updatedSession.drug_screen,
            questions: updatedSession.questions,
          })
        }
      }
    } catch (error: any) {
      console.error('Error refreshing data:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)
      // Handle 401 (unauthorized) - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/staff/login'
        return
      }
      // Silently fail for other errors - don't show error on background refresh
    } finally {
      setRefreshing(false)
    }
  }

  // Reload data periodically to catch new sessions (in background without clearing screen)
  useEffect(() => {
    if (!recruiterId) return
    // Wait a bit before starting the interval to avoid conflicts with initial load
    let intervalId: NodeJS.Timeout | null = null
    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        refreshDataInBackground()
      }, 30000) // Reload every 30 seconds
    }, 5000) // Start refreshing 5 seconds after initial load
    return () => {
      clearTimeout(timeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [recruiterId])

  const handleStatusToggle = async () => {
    if (!recruiter || !recruiterId) return
    const newStatus = recruiter.status === 'available' ? 'busy' : 'available'
    try {
      await updateRecruiterStatus(parseInt(recruiterId), newStatus)
      setRecruiter({ ...recruiter, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const handleStartSession = async (sessionId: number) => {
    if (!recruiterId) return
    try {
      const result = await startSession(parseInt(recruiterId), sessionId)
      await loadData()
      
      // If row was generated, load it for editing
      if (result.generated_row) {
        // Reload sessions to get updated data
        const allSessionsData = await getInfoSessions()
        const updatedSessionData = allSessionsData.find(s => s.id === sessionId)
        if (updatedSessionData) {
          // Convert to AssignedSession format
          const updatedSession: AssignedSession = {
            id: updatedSessionData.id,
            first_name: updatedSessionData.first_name,
            last_name: updatedSessionData.last_name,
            email: updatedSessionData.email,
            phone: updatedSessionData.phone,
            zip_code: updatedSessionData.zip_code,
            session_type: updatedSessionData.session_type,
            time_slot: updatedSessionData.time_slot,
            status: updatedSessionData.status,
            ob365_sent: updatedSessionData.ob365_sent || false,
            i9_sent: updatedSessionData.i9_sent || false,
            existing_i9: updatedSessionData.existing_i9 || false,
            ineligible: updatedSessionData.ineligible || false,
            rejected: updatedSessionData.rejected || false,
            drug_screen: updatedSessionData.drug_screen || false,
            questions: updatedSessionData.questions || false,
            started_at: updatedSessionData.started_at || null,
            completed_at: updatedSessionData.completed_at || null,
            duration_minutes: updatedSessionData.duration_minutes || null,
            created_at: updatedSessionData.created_at,
            assigned_recruiter_id: updatedSessionData.assigned_recruiter_id,
            assigned_recruiter_name: updatedSessionData.assigned_recruiter_name,
            generated_row: result.generated_row,
          }
          setSelectedSession(updatedSession)
        }
      }
      
      alert('Session started! Row generated.')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Error starting session')
    }
  }


  const handleCompleteSession = async () => {
    if (!selectedSession || !recruiterId) return
    try {
      await completeSession(parseInt(recruiterId), selectedSession.id, documentStatus)
      await loadData()
      setSelectedSession(null)
      setDocumentStatus({
        ob365_sent: false,
        i9_sent: false,
        existing_i9: false,
        ineligible: false,
        rejected: false,
        drug_screen: false,
        questions: false,
      })
      alert('Session completed!')
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Error completing session')
    }
  }

  const handleUpdateDocuments = async () => {
    if (!selectedSession || !recruiterId) return
    try {
      await updateSessionDocuments(parseInt(recruiterId), selectedSession.id, documentStatus)
      await loadData()
      alert('Documents updated!')
    } catch (error) {
      console.error('Error updating documents:', error)
      alert('Error updating documents')
    }
  }

  const handleOpenOrientationDetails = async (orientation: NewHireOrientation) => {
    try {
      const fullOrientation = await getNewHireOrientation(orientation.id)
      setSelectedOrientation(fullOrientation)
    } catch (error) {
      console.error('Error loading orientation details:', error)
      alert('Error loading orientation details')
    }
  }

  const handleSaveOrientationDetails = async () => {
    if (!selectedOrientation) return
    
    try {
      await updateNewHireOrientation(selectedOrientation.id, {
        process_status: selectedOrientation.process_status,
        badge_status: selectedOrientation.badge_status,
        missing_steps: selectedOrientation.missing_steps,
        status: selectedOrientation.status
      })
      await loadData()
      setSelectedOrientation(null)
      alert('Orientation details updated successfully')
    } catch (error) {
      console.error('Error saving orientation details:', error)
      alert('Error saving orientation details')
    }
  }

  const renderAllInfoSessions = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group sessions by date
    const groupedSessions: { [key: string]: any[] } = {}
    allInfoSessions.forEach((session) => {
      const dateKey = getMiamiDateKey(session.created_at)
      if (!groupedSessions[dateKey]) {
        groupedSessions[dateKey] = []
      }
      groupedSessions[dateKey].push(session)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedSessions).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 flex justify-between items-center">
          <p className="text-blue-800 font-bold">📋 All Info Sessions</p>
          <button
            onClick={async () => {
              try {
                setLoading(true)
                const allSessions = await getInfoSessions()
                setAllInfoSessions(allSessions || [])
                alert('Data refreshed!')
              } catch (error) {
                console.error('Error refreshing:', error)
                alert('Error refreshing data')
              } finally {
                setLoading(false)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
        {allInfoSessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No info sessions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">ZIP Code</th>
                  <th className="px-4 py-2 text-left">Time Slot</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Assigned Recruiter</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const sessionsForDate = groupedSessions[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(sessionsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {sessionsForDate.map((session, sessionIndex) => (
                        <tr key={session.id} className={`border-b hover:bg-gray-50 ${
                          session.assigned_recruiter_id === parseInt(recruiterId || '0') ? 'bg-blue-50' : ''
                        }`}>
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {sessionIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {session.first_name} {session.last_name}
                          </td>
                          <td className="px-4 py-2">{session.email}</td>
                          <td className="px-4 py-2">{session.phone}</td>
                          <td className="px-4 py-2">{session.zip_code}</td>
                          <td className="px-4 py-2">{session.time_slot}</td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(session.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.assigned_recruiter_name ? (
                              <a
                                href={`/recruiter/${session.assigned_recruiter_id}/dashboard`}
                                className={`px-2 py-1 rounded text-sm ${
                                  session.assigned_recruiter_id === parseInt(recruiterId || '0')
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                              >
                                {session.assigned_recruiter_name}
                                {session.assigned_recruiter_id === parseInt(recruiterId || '0') && ' (You)'}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              session.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : session.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderMyVisits = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group visits by date
    const groupedVisits: { [key: string]: any[] } = {}
    myVisits.forEach((visit) => {
      const dateKey = getMiamiDateKey(visit.created_at)
      if (!groupedVisits[dateKey]) {
        groupedVisits[dateKey] = []
      }
      groupedVisits[dateKey].push(visit)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedVisits).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 flex justify-between items-center">
          <p className="text-blue-800 font-bold">👥 My Visits</p>
          <button
            onClick={async () => {
              try {
                await loadData()
                alert('Data refreshed!')
              } catch (error) {
                console.error('Error refreshing:', error)
                alert('Error refreshing data')
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
        {myVisits.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-left max-w-2xl mx-auto">
              <p className="text-yellow-800 font-bold mb-2">⚠️ No visits found</p>
              <p className="text-yellow-700 text-sm mb-2">
                If you just created a visit, make sure:
              </p>
              <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                <li>You selected yourself as the staff member to visit</li>
                <li>You are logged in with the correct account</li>
                <li>The visit was created successfully (check for confirmation message)</li>
              </ul>
            </div>
            <p className="text-gray-500 mb-4">No visits assigned to you</p>
            <p className="text-sm text-gray-400 mb-4">
              Visits will appear here when someone registers a team visit and selects you as the staff member to visit.
            </p>
            <button
              onClick={async () => {
                try {
                  setLoading(true)
                  await loadData()
                  alert('Data refreshed! Check the list again.')
                } catch (error) {
                  console.error('Error refreshing:', error)
                  alert('Error refreshing data. Please check the console for details.')
                } finally {
                  setLoading(false)
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              🔄 Refresh to check for new visits
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Visitor Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const visitsForDate = groupedVisits[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(visitsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {visitsForDate.map((visit, visitIndex) => (
                        <tr key={visit.id} className={`border-b hover:bg-gray-50 ${
                          visit.status === 'pending' ? 'bg-yellow-50' : ''
                        }`}>
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {visitIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {visit.visitor_name}
                          </td>
                          <td className="px-4 py-2">{visit.visitor_email || 'N/A'}</td>
                          <td className="px-4 py-2">{visit.team || 'N/A'}</td>
                          <td className="px-4 py-2">
                            <div className="max-w-xs truncate" title={visit.reason}>
                              {visit.reason}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(visit.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              visit.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : visit.status === 'notified'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {visit.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {visit.status === 'pending' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await notifyTeamVisit(visit.id)
                                    await loadData()
                                  } catch (error) {
                                    console.error('Error notifying visit:', error)
                                    alert('Error marking as notified')
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Mark as Notified
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderBadges = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group badges by date
    const groupedBadges: { [key: string]: any[] } = {}
    badges.forEach((badge) => {
      const dateKey = getMiamiDateKey(badge.created_at)
      if (!groupedBadges[dateKey]) {
        groupedBadges[dateKey] = []
      }
      groupedBadges[dateKey].push(badge)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedBadges).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-800 font-bold">🪪 Badges</p>
        </div>
        {badges.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No badges registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Print Badge</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const badgesForDate = groupedBadges[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(badgesForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {badgesForDate.map((badge, badgeIndex) => (
                        <tr key={badge.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {badgeIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {badge.first_name} {badge.last_name}
                          </td>
                          <td className="px-4 py-2">{badge.email}</td>
                          <td className="px-4 py-2">{badge.phone}</td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(badge.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              badge.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : badge.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {badge.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <a
                              href="https://kellyeducationsouthflorida.us.trustedauth.com/#/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded text-sm transition-colors"
                            >
                              🖨️ Print
                            </a>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderFingerprints = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group fingerprints by date
    const groupedFingerprints: { [key: string]: any[] } = {}
    fingerprints.forEach((fingerprint) => {
      const dateKey = getMiamiDateKey(fingerprint.created_at)
      if (!groupedFingerprints[dateKey]) {
        groupedFingerprints[dateKey] = []
      }
      groupedFingerprints[dateKey].push(fingerprint)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedFingerprints).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-800 font-bold">👆 Fingerprints</p>
        </div>
        {fingerprints.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No fingerprint appointments registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">ZIP Code</th>
                  <th className="px-4 py-2 text-left">Appointment Time</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const fingerprintsForDate = groupedFingerprints[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(fingerprintsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {fingerprintsForDate.map((fingerprint, fingerprintIndex) => (
                        <tr key={fingerprint.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {fingerprintIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {fingerprint.first_name} {fingerprint.last_name}
                          </td>
                          <td className="px-4 py-2">{fingerprint.email}</td>
                          <td className="px-4 py-2">{fingerprint.phone}</td>
                          <td className="px-4 py-2">{fingerprint.zip_code || 'N/A'}</td>
                          <td className="px-4 py-2">{fingerprint.appointment_time}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              fingerprint.fingerprint_type === 'dcf' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {fingerprint.fingerprint_type}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(fingerprint.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              fingerprint.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : fingerprint.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {fingerprint.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderNewHireOrientations = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group orientations by date
    const groupedOrientations: { [key: string]: NewHireOrientation[] } = {}
    newHireOrientations.forEach((orientation) => {
      const dateKey = getMiamiDateKey(orientation.created_at)
      if (!groupedOrientations[dateKey]) {
        groupedOrientations[dateKey] = []
      }
      groupedOrientations[dateKey].push(orientation)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedOrientations).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-800 font-bold">🎓 New Hire Orientations</p>
        </div>
        {newHireOrientations.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No new hire orientations registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Time Slot</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const orientationsForDate = groupedOrientations[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(orientationsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {orientationsForDate.map((orientation, orientationIndex) => (
                        <tr 
                          key={orientation.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOpenOrientationDetails(orientation)}
                        >
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {orientationIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {orientation.first_name} {orientation.last_name}
                          </td>
                          <td className="px-4 py-2">{orientation.email}</td>
                          <td className="px-4 py-2">{orientation.phone}</td>
                          <td className="px-4 py-2">{orientation.time_slot}</td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(orientation.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              orientation.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : orientation.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {orientation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const openSessionDetails = async (session: AssignedSession) => {
    setSelectedSession(session)
    setDocumentStatus({
      ob365_sent: session.ob365_sent,
      i9_sent: session.i9_sent,
      existing_i9: session.existing_i9,
      ineligible: session.ineligible,
      rejected: session.rejected,
      drug_screen: session.drug_screen,
      questions: session.questions,
    })
    
    // Load row data if session has a generated_row
    if (session.generated_row && selectedTemplate) {
      setSessionGeneratedRow(session.generated_row)
      loadRowDataFromGeneratedRow(session.generated_row, session)
    } else if ((session.status === 'in-progress' || session.status === 'registered' || session.status === 'completed') && session.started_at && selectedTemplate) {
      // If no generated_row exists but session is in-progress, generate initial data
      const initialData: Record<string, any> = {}
      
      // Get recruiter initials
      let recruiterInitials = ''
      if (recruiter) {
        const nameParts = recruiter.name.split(' ')
        if (nameParts.length >= 2) {
          recruiterInitials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
        } else if (nameParts.length === 1) {
          recruiterInitials = nameParts[0][0].toUpperCase()
        }
      }
      
      selectedTemplate.columns.forEach((col) => {
        const colNameLower = col.name.toLowerCase().trim()
        const colNameUpper = col.name.toUpperCase().trim()
        
        // Leave FP expiration date blank
        if (colNameLower.includes('fp') && colNameLower.includes('expiration')) {
          initialData[col.name] = ''  // Leave blank
        } 
        // Map Applicant Name
        else if (colNameLower === 'applicant name' || (colNameLower.includes('applicant') && colNameLower.includes('name'))) {
          initialData[col.name] = `${session.first_name} ${session.last_name}`
        } 
        // Map Talent Phone
        else if (colNameLower === 'talent phone' || (colNameLower.includes('talent') && colNameLower.includes('phone'))) {
          initialData[col.name] = session.phone
        } 
        // Map Talent Email
        else if (colNameLower === 'talent email' || (colNameLower.includes('talent') && colNameLower.includes('email'))) {
          initialData[col.name] = session.email
        } 
        // Fallback for other phone/numero patterns
        else if (colNameLower.includes('numero') || (colNameLower.includes('phone') && colNameLower.includes('numero'))) {
          initialData[col.name] = session.phone
        } 
        // Fallback for other email patterns
        else if (colNameLower.includes('email') && !colNameLower.includes('talent')) {
          initialData[col.name] = session.email
        } 
        // Map recruiter initials to R and O columns
        else if (colNameUpper === 'R' || colNameUpper === 'O') {
          initialData[col.name] = recruiterInitials
        } 
        // Set date fields to today
        else if (col.column_type === 'date') {
          initialData[col.name] = new Date().toISOString().split('T')[0]
        } 
        // Use default value for other fields
        else {
          initialData[col.name] = col.default_value || ''
        }
      })
      setSessionRowData(initialData)
      
      // If there's a generated_row, use it; otherwise generate one
      if (session.generated_row) {
        setSessionGeneratedRow(session.generated_row)
        loadRowDataFromGeneratedRow(session.generated_row, session)
      }
    } else {
      // Clear row data if not applicable
      setSessionGeneratedRow('')
      setSessionRowData({})
    }
  }

  const loadRowDataFromGeneratedRow = (rowText: string, session: AssignedSession) => {
    if (!selectedTemplate) {
      // If no template selected, try to get the first one
      if (templates.length > 0) {
        setSelectedTemplate(templates[0])
        // Recursively call with the first template
        setTimeout(() => {
          if (templates[0]) {
            const sortedColumns = [...templates[0].columns].sort((a, b) => a.order - b.order)
            const values = rowText.split('\t')
            const newRowData: Record<string, any> = {}
            sortedColumns.forEach((column, index) => {
              if (index < values.length) {
                newRowData[column.name] = values[index]
              } else {
                newRowData[column.name] = column.default_value || ''
              }
            })
            // Ensure Applicant Name, Talent Phone, and Talent Email are set
            ensureSessionDataInRow(newRowData, session, templates[0])
            setSessionRowData(newRowData)
          }
        }, 100)
      }
      return
    }
    
    // Split the row by tabs
    const values = rowText.split('\t')
    
    // Map values to column names
    const sortedColumns = [...selectedTemplate.columns].sort((a, b) => a.order - b.order)
    const newRowData: Record<string, any> = {}
    
    sortedColumns.forEach((column, index) => {
      if (index < values.length) {
        newRowData[column.name] = values[index]
      } else {
        newRowData[column.name] = column.default_value || ''
      }
    })
    
    // Ensure Applicant Name, Talent Phone, and Talent Email are set
    ensureSessionDataInRow(newRowData, session, selectedTemplate)
    
    setSessionRowData(newRowData)
  }

  const ensureSessionDataInRow = (rowData: Record<string, any>, session: AssignedSession, template: RowTemplate) => {
    template.columns.forEach((col) => {
      const colNameLower = col.name.toLowerCase().trim()
      
      // Ensure Applicant Name is set
      if (colNameLower === 'applicant name' || (colNameLower.includes('applicant') && colNameLower.includes('name'))) {
        rowData[col.name] = `${session.first_name} ${session.last_name}`
      }
      // Ensure Talent Phone is set
      else if (colNameLower === 'talent phone' || (colNameLower.includes('talent') && colNameLower.includes('phone'))) {
        rowData[col.name] = session.phone
      }
      // Ensure Talent Email is set
      else if (colNameLower === 'talent email' || (colNameLower.includes('talent') && colNameLower.includes('email'))) {
        rowData[col.name] = session.email
      }
    })
  }

  const handleUpdateSessionRow = async () => {
    if (!selectedTemplate || !selectedSession || !recruiterId) return
    
    try {
      // Get recruiter initials
      let recruiterInitials = ''
      if (recruiter) {
        const nameParts = recruiter.name.split(' ')
        if (nameParts.length >= 2) {
          recruiterInitials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
        } else if (nameParts.length === 1) {
          recruiterInitials = nameParts[0][0].toUpperCase()
        }
      }
      
      const currentDate = new Date().toISOString().split('T')[0]
      const dataToSend: Record<string, any> = { ...sessionRowData }
      
      selectedTemplate.columns.forEach((col) => {
        const colNameUpper = col.name.toUpperCase().trim()
        const colNameLower = col.name.toLowerCase().trim()
        
        // Leave FP expiration date blank
        if (colNameLower.includes('fp') && colNameLower.includes('expiration')) {
          dataToSend[col.name] = ''  // Always leave blank
        }
        // Ensure Applicant Name is always set
        else if (colNameLower === 'applicant name' || (colNameLower.includes('applicant') && colNameLower.includes('name'))) {
          dataToSend[col.name] = `${selectedSession.first_name} ${selectedSession.last_name}`
        }
        // Ensure Talent Phone is always set
        else if (colNameLower === 'talent phone' || (colNameLower.includes('talent') && colNameLower.includes('phone'))) {
          dataToSend[col.name] = selectedSession.phone
        }
        // Ensure Talent Email is always set
        else if (colNameLower === 'talent email' || (colNameLower.includes('talent') && colNameLower.includes('email'))) {
          dataToSend[col.name] = selectedSession.email
        }
        // Ensure recruiter initials are in columns R and O
        else if ((colNameUpper === 'R' || colNameUpper === 'O') && !dataToSend[col.name]) {
          dataToSend[col.name] = recruiterInitials
        }
        // Fallback for other phone/numero patterns
        else if ((colNameLower.includes('numero') || (colNameLower.includes('phone') && colNameLower.includes('numero'))) && !dataToSend[col.name]) {
          dataToSend[col.name] = selectedSession.phone
        }
        // Fallback for other email patterns
        else if (colNameLower.includes('email') && !colNameLower.includes('talent') && !dataToSend[col.name]) {
          dataToSend[col.name] = selectedSession.email
        }
        else if (col.column_type === 'date' && !dataToSend[col.name]) {
          dataToSend[col.name] = currentDate
        }
      })
      
      const result = await generateRow(selectedTemplate.id, dataToSend)
      setSessionGeneratedRow(result.row_text)
      setSessionRowCopied(false)
      
      // Save the updated row to the session in the database
      await updateSessionDocuments(parseInt(recruiterId), selectedSession.id, {
        ...documentStatus,
        generated_row: result.row_text,
      })
      
      // Reload data to get updated session
      await loadData()
      alert('Row updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error generating row')
    }
  }

  const handleCopySessionRow = async () => {
    if (!sessionGeneratedRow) return

    try {
      await navigator.clipboard.writeText(sessionGeneratedRow)
      setSessionRowCopied(true)
      setTimeout(() => setSessionRowCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = sessionGeneratedRow
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setSessionRowCopied(true)
      setTimeout(() => setSessionRowCopied(false), 2000)
    }
  }

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p>Recruiter not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Status Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold">{recruiter.name}</h1>
                <p className="text-gray-600">{recruiter.email}</p>
              </div>
              {refreshing && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold ${
                recruiter.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Status: {recruiter.status === 'available' ? 'Available' : 'Busy'}
              </div>
              <button
                onClick={handleStatusToggle}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  recruiter.status === 'available'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {recruiter.status === 'available' ? 'Mark as Busy' : 'Mark as Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 My Sessions
            </button>
            <button
              onClick={() => setActiveTab('all-info-sessions')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'all-info-sessions'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 All Info Sessions
            </button>
            <button
              onClick={() => setActiveTab('new-hire-orientation')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'new-hire-orientation'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎓 New Hire Orientation
            </button>
            <button
              onClick={() => setActiveTab('fingerprints')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'fingerprints'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👆 Fingerprints
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'badges'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🪪 Badges
            </button>
            <button
              onClick={() => setActiveTab('my-visits')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'my-visits'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 My Visits
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('chr')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'chr'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 CHR
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'statistics' ? (
          <StatisticsDashboard />
        ) : activeTab === 'chr' ? (
          <CHRPage />
        ) : activeTab === 'all-info-sessions' ? (
          renderAllInfoSessions()
        ) : activeTab === 'new-hire-orientation' ? (
          renderNewHireOrientations()
        ) : activeTab === 'fingerprints' ? (
          renderFingerprints()
        ) : activeTab === 'badges' ? (
          renderBadges()
        ) : activeTab === 'my-visits' ? (
          renderMyVisits()
        ) : (
        <>
        {false ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">All Info Sessions</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading sessions...</p>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-left max-w-2xl mx-auto">
                      <p className="text-yellow-800 font-bold mb-2">⚠️ No sessions found</p>
                      <p className="text-yellow-700 text-sm mb-2">
                        If you just created a session, make sure:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                        <li>The session was assigned to you (recruiter assignment is automatic)</li>
                        <li>You are logged in with the correct recruiter account</li>
                        <li>The session was created successfully (check for confirmation message)</li>
                      </ul>
                    </div>
                    <p className="text-gray-500 mb-4">No info sessions assigned to you</p>
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true)
                          await loadData()
                          alert('Data refreshed! Check the list again.')
                        } catch (error) {
                          console.error('Error refreshing:', error)
                          alert('Error refreshing data. Please check the console for details.')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      🔄 Refresh to check for new sessions
                    </button>
                  </div>
                ) : (() => {
                  // Group sessions by date
                  const groupedSessions: { [key: string]: AssignedSession[] } = {}
                  sessions.forEach((session) => {
                    const dateKey = getMiamiDateKey(session.created_at)
                    if (!groupedSessions[dateKey]) {
                      groupedSessions[dateKey] = []
                    }
                    groupedSessions[dateKey].push(session)
                  })
                  
                  // Sort date keys (most recent first)
                  const sortedDateKeys = Object.keys(groupedSessions).sort().reverse()
                  
                  return (
                    <>
                      {sortedDateKeys.map((dateKey, dateIndex) => {
                        const sessionsForDate = groupedSessions[dateKey]
                        return (
                          <div key={dateKey}>
                            {/* Date Separator */}
                            {dateIndex > 0 && (
                              <div className="my-4 py-3 bg-gray-100 border-t-2 border-b-2 border-gray-300">
                                <div className="text-center">
                                  <span className="text-gray-700 font-bold text-lg">
                                    ─── {formatMiamiDateDisplay(sessionsForDate[0].created_at)} ───
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Sessions for this date */}
                            {sessionsForDate.map((session, sessionIndex) => (
                              <div
                                key={session.id}
                                className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors mb-4 ${
                                  session.assigned_recruiter_id === parseInt(recruiterId || '0')
                                    ? 'border-blue-500 bg-blue-50'
                                    : ''
                                }`}
                                onClick={() => openSessionDetails(session)}
                              >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-600 text-lg">
                              #{sessionIndex + 1}
                            </span>
                            <h3 className="font-bold text-lg">
                              {session.first_name} {session.last_name}
                            </h3>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  const pdfBlob = await downloadAnswersPDF(session.id)
                                  const url = window.URL.createObjectURL(pdfBlob)
                                  const link = document.createElement('a')
                                  link.href = url
                                  const filename = `${session.first_name}_${session.last_name}_answers.pdf`
                                  link.download = filename.replace(/\s+/g, '_')
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  window.URL.revokeObjectURL(url)
                                } catch (error) {
                                  console.error('Error downloading PDF:', error)
                                  alert('Error downloading PDF. The applicant may not have answered the questions yet.')
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Download Answers PDF"
                            >
                              📓
                            </button>
                            {session.assigned_recruiter_id === parseInt(recruiterId || '0') && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">
                                Assigned to You
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{session.email}</p>
                          <p className="text-sm text-gray-500">
                            {session.time_slot} - {session.session_type}
                          </p>
                          {session.assigned_recruiter_name ? (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-semibold">Assigned to:</span>{' '}
                              <a
                                href={`/recruiter/${session.assigned_recruiter_id}/dashboard`}
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {session.assigned_recruiter_name}
                              </a>
                            </p>
                          ) : (
                            <p className="text-sm text-yellow-600 font-semibold mt-1">
                              ⚠️ Not assigned - will be assigned automatically
                            </p>
                          )}
                          {session.duration_minutes && (
                            <p className="text-sm text-blue-600 mt-1">
                              Duration: {formatDuration(session.duration_minutes)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded text-sm font-bold ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.status}
                          </span>
                          {!session.started_at && session.status !== 'completed' && (
                            (session.assigned_recruiter_id === parseInt(recruiterId || '0') || !session.assigned_recruiter_id) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartSession(session.id)
                                }}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Start
                              </button>
                            ) : (
                              <p className="mt-2 text-xs text-gray-500">
                                Assigned to another recruiter
                              </p>
                            )
                          )}
                          {session.status === 'completed' && (
                            <p className="mt-2 text-xs text-blue-600">
                              Can view and edit
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                            ))}
                          </div>
                        )
                      })}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Session Details Panel */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-4">Session Details</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">
                        {selectedSession.first_name} {selectedSession.last_name}
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const pdfBlob = await downloadAnswersPDF(selectedSession.id)
                            const url = window.URL.createObjectURL(pdfBlob)
                            const link = document.createElement('a')
                            link.href = url
                            const filename = `${selectedSession.first_name}_${selectedSession.last_name}_answers.pdf`
                            link.download = filename.replace(/\s+/g, '_')
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            window.URL.revokeObjectURL(url)
                          } catch (error) {
                            console.error('Error downloading PDF:', error)
                            alert('Error downloading PDF. The applicant may not have answered the questions yet.')
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors text-xl"
                        title="Download Answers PDF"
                      >
                        📓
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{selectedSession.email}</p>
                    <p className="text-sm text-gray-600">{selectedSession.phone}</p>
                    {selectedSession.assigned_recruiter_name && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Assigned to:</span> {selectedSession.assigned_recruiter_name}
                      </p>
                    )}
                    {!selectedSession.assigned_recruiter_name && (
                      <p className="text-sm text-gray-400 mt-2">
                        Not assigned yet
                      </p>
                    )}
                  </div>

                  {selectedSession.started_at && (
                    <div className="text-sm">
                      <p>
                        Started: {formatMiamiTime(selectedSession.started_at)}
                      </p>
                      {selectedSession.completed_at && (
                        <p>
                          Completed: {formatMiamiTime(selectedSession.completed_at)}
                        </p>
                      )}
                      {selectedSession.duration_minutes && (
                        <p className="font-bold text-blue-600">
                          Duration: {formatDuration(selectedSession.duration_minutes)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Row Generator for In-Progress, Registered, and Completed Sessions */}
                  {(selectedSession.status === 'in-progress' || selectedSession.status === 'registered' || selectedSession.status === 'completed') && selectedTemplate && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-bold mb-3">Row Generator</h3>
                      <div className="space-y-3">
                        {selectedTemplate.columns
                          .sort((a, b) => a.order - b.order)
                          .map((column) => (
                            <div key={column.id || column.order}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {column.name}
                                {column.is_required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              {(column.column_type === 'dropdown' && column.options) || 
                               (column.name.toLowerCase().includes('mdps') && column.name.toLowerCase().includes('training')) ? (
                                <select
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">Select...</option>
                                  {/* If it's MDPS training but not a dropdown, show common options */}
                                  {column.column_type !== 'dropdown' && column.name.toLowerCase().includes('mdps') && column.name.toLowerCase().includes('training') ? (
                                    <>
                                      <option value="Pending">Pending</option>
                                      <option value="Completed">Completed</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Not Started">Not Started</option>
                                      <option value="N/A">N/A</option>
                                    </>
                                  ) : (
                                    column.options?.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))
                                  )}
                                  {/* Allow custom value if current value is not in options */}
                                  {sessionRowData[column.name] && 
                                   column.options && 
                                   !column.options.includes(sessionRowData[column.name]) && (
                                    <option value={sessionRowData[column.name]}>
                                      {sessionRowData[column.name]} (Custom)
                                    </option>
                                  )}
                                </select>
                              ) : column.column_type === 'note' ? (
                                <textarea
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  rows={2}
                                />
                              ) : column.column_type === 'date' ? (
                                <input
                                  type="date"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              ) : column.column_type === 'number' ? (
                                <input
                                  type="number"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  placeholder={column.placeholder}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          ))}
                        <button
                          onClick={handleUpdateSessionRow}
                          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-bold"
                        >
                          Update Row
                        </button>
                        {sessionGeneratedRow && (
                          <div className="border rounded p-3 bg-gray-50 mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-semibold">Generated Row (Tab-separated for Excel):</div>
                              <button
                                onClick={handleCopySessionRow}
                                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                                  sessionRowCopied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                title="Copy row to clipboard for pasting in Excel"
                              >
                                {sessionRowCopied ? '✅ Copied!' : '📋 Copy Row'}
                              </button>
                            </div>
                            <pre className="text-xs whitespace-pre-wrap break-all p-2 bg-white border rounded overflow-x-auto">
                              {sessionGeneratedRow}
                            </pre>
                            <p className="text-xs text-gray-500 mt-2">
                              💡 Tip: Click "Copy Row" and paste directly into Excel. The values are separated by tabs.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-3">Document Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.ob365_sent}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, ob365_sent: e.target.checked })
                          }
                          className="mr-2"
                        />
                        OB365 Sent
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.i9_sent}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, i9_sent: e.target.checked })
                          }
                          className="mr-2"
                        />
                        I9 Sent
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.existing_i9}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, existing_i9: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Has Existing I9
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.ineligible}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, ineligible: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Ineligible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.rejected}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, rejected: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Rejected
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.drug_screen}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, drug_screen: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Drug Screen
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.questions}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, questions: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Questions
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={handleUpdateDocuments}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Documents
                    </button>
                    {selectedSession.status !== 'completed' && (
                      <button
                        onClick={handleCompleteSession}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Complete Session
                      </button>
                    )}
                    {selectedSession.status === 'completed' && (
                      <button
                        onClick={async () => {
                          if (!selectedSession || !recruiterId) return
                          try {
                            // Reopen the session by updating status to in-progress
                            await updateSessionDocuments(parseInt(recruiterId), selectedSession.id, {
                              ...documentStatus,
                              status: 'in-progress'
                            })
                            await loadData()
                            alert('Session reopened! You can now edit it.')
                          } catch (error) {
                            console.error('Error reopening session:', error)
                            alert('Error reopening session')
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Reopen Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-500 text-center">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
        )}
        </>
        )}

      {/* New Hire Orientation Details Modal */}
      {selectedOrientation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedOrientation.first_name} {selectedOrientation.last_name}
              </h2>
              <button
                onClick={() => setSelectedOrientation(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Process Status
                </label>
                <select
                  value={selectedOrientation.process_status || ''}
                  onChange={(e) => setSelectedOrientation({ ...selectedOrientation, process_status: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Status
                </label>
                <select
                  value={selectedOrientation.badge_status || 'pending'}
                  onChange={(e) => setSelectedOrientation({ ...selectedOrientation, badge_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="printed">Printed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps Status
                </label>
                <select
                  value={selectedOrientation.missing_steps ? 'missing' : 'completed'}
                  onChange={(e) => {
                    if (e.target.value === 'missing') {
                      setSelectedOrientation({ ...selectedOrientation, missing_steps: '' })
                    } else {
                      setSelectedOrientation({ ...selectedOrientation, missing_steps: null })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="completed">Completed</option>
                  <option value="missing">Missing Steps</option>
                </select>
              </div>

              {selectedOrientation.missing_steps !== null && selectedOrientation.missing_steps !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's Missing?
                  </label>
                  <textarea
                    value={selectedOrientation.missing_steps || ''}
                    onChange={(e) => setSelectedOrientation({ ...selectedOrientation, missing_steps: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Describe what steps are missing..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps
                </label>
                <div className="space-y-2">
                  {selectedOrientation.steps && selectedOrientation.steps.length > 0 ? (
                    selectedOrientation.steps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={step.is_completed}
                          disabled
                          className="rounded"
                        />
                        <span className={step.is_completed ? 'line-through text-gray-500' : ''}>
                          {step.step_name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No steps available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedOrientation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrientationDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default RecruiterDashboard

