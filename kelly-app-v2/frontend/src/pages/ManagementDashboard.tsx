import React, { useState, useEffect } from 'react'
import { getLiveInfoSessions, getNewHireOrientations, getBadges, getFingerprints, getMyVisits, getCurrentUser, notifyTeamVisit, getNewHireOrientation, updateNewHireOrientation } from '../services/api'
import type { InfoSessionWithSteps, NewHireOrientation, NewHireOrientationWithSteps } from '../types'
import { formatMiamiTime, getMiamiDateKey, formatMiamiDateDisplay } from '../utils/dateUtils'
import CHRPage from './CHRPage'
import StatisticsDashboard from './StatisticsDashboard'
import EventManagement from '../components/EventManagement'

type TabType = 'info-session' | 'new-hire-orientation' | 'badges' | 'fingerprints' | 'my-visits' | 'statistics' | 'chr' | 'event'

function ManagementDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('info-session')
  const [liveSessions, setLiveSessions] = useState<InfoSessionWithSteps[]>([])
  const [newHireOrientations, setNewHireOrientations] = useState<NewHireOrientation[]>([])
  const [selectedOrientation, setSelectedOrientation] = useState<NewHireOrientationWithSteps | null>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [fingerprints, setFingerprints] = useState<any[]>([])
  const [myVisits, setMyVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadData()
  }, [activeTab])

  useEffect(() => {
    // Set up polling for live updates every 5 seconds
    const interval = setInterval(refreshDataInBackground, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/staff/login'
      return
    }
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      // Not authenticated, redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/staff/login'
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      switch (activeTab) {
        case 'info-session':
          const live = await getLiveInfoSessions()
          console.log('📊 ManagementDashboard: Loaded live sessions:', live.length)
          setLiveSessions(live)
          break
        case 'new-hire-orientation':
          const orientations = await getNewHireOrientations()
          setNewHireOrientations(orientations)
          break
        case 'badges':
          const badgesData = await getBadges()
          setBadges(badgesData)
          break
        case 'fingerprints':
          const fingerprintsData = await getFingerprints()
          setFingerprints(fingerprintsData)
          break
        case 'my-visits':
          const visits = await getMyVisits()
          setMyVisits(visits)
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshDataInBackground = async () => {
    try {
      setRefreshing(true)
      // Load data in background without clearing the screen
      switch (activeTab) {
        case 'info-session':
          const live = await getLiveInfoSessions()
          console.log('🔄 ManagementDashboard: Refreshed live sessions:', live.length)
          setLiveSessions(live)
          break
        case 'new-hire-orientation':
          const orientations = await getNewHireOrientations()
          setNewHireOrientations(orientations)
          break
        case 'badges':
          const badgesData = await getBadges()
          setBadges(badgesData)
          break
        case 'fingerprints':
          const fingerprintsData = await getFingerprints()
          setFingerprints(fingerprintsData)
          break
        case 'my-visits':
          const visits = await getMyVisits()
          setMyVisits(visits)
          break
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      // Silently fail - don't show error on background refresh
    } finally {
      setRefreshing(false)
    }
  }

  const renderInfoSessionLive = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group sessions by date and time slot
    const groupedSessions: { [key: string]: InfoSessionWithSteps[] } = {}
    liveSessions.forEach((session) => {
      const dateKey = getMiamiDateKey(session.created_at)
      const groupKey = `${dateKey}_${session.time_slot}`
      if (!groupedSessions[groupKey]) {
        groupedSessions[groupKey] = []
      }
      groupedSessions[groupKey].push(session)
    })
    
    // Sort group keys (most recent first, then by time slot)
    const sortedGroupKeys = Object.keys(groupedSessions).sort((a, b) => {
      const [dateA, timeA] = a.split('_')
      const [dateB, timeB] = b.split('_')
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA) // Most recent first
      }
      // Same date, sort by time slot (8:30 AM first, then 1:30 PM)
      return timeA === '8:30 AM' ? -1 : timeB === '8:30 AM' ? 1 : timeA.localeCompare(timeB)
    })
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-800 font-bold">🟢 Live Registration - Updates every 5 seconds</p>
        </div>
        {liveSessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No active registrations</p>
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
                  <th className="px-4 py-2 text-left">Exclusion</th>
                </tr>
              </thead>
              <tbody>
                {sortedGroupKeys.map((groupKey, groupIndex) => {
                  const sessionsForGroup = groupedSessions[groupKey]
                  const [dateKey, timeSlot] = groupKey.split('_')
                  const firstSession = sessionsForGroup[0]
                  const isMorning = timeSlot === '8:30 AM'
                  
                  return (
                    <React.Fragment key={groupKey}>
                      {/* Group Header - Date, Time Slot, and Session Type */}
                      <tr>
                        <td colSpan={10} className={`px-4 py-4 ${isMorning ? 'bg-blue-200' : 'bg-green-200'} border-t-2 ${isMorning ? 'border-blue-400' : 'border-green-400'} border-b-2`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-lg font-bold text-lg ${isMorning ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                                {timeSlot}
                              </span>
                              <span className="text-gray-800 font-bold text-lg">
                                {formatMiamiDateDisplay(firstSession.created_at)}
                              </span>
                              <span className="text-gray-600 font-semibold">
                                {firstSession.session_type === 'new-hire' ? '📋 New Hire' : '🔄 Reactivation'}
                              </span>
                            </div>
                            <span className="text-gray-700 font-semibold">
                              {sessionsForGroup.length} {sessionsForGroup.length === 1 ? 'session' : 'sessions'}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {sessionsForGroup.map((session, sessionIndex) => {
                        // Color based on status first, then time slot
                        const isCompleted = session.status === 'completed'
                        const isMorning = session.time_slot === '8:30 AM'
                        const rowBgColor = isCompleted 
                          ? 'bg-green-100 hover:bg-green-200 border-green-300' 
                          : isMorning 
                            ? 'bg-blue-50 hover:bg-blue-100' 
                            : 'bg-green-50 hover:bg-green-100'
                        
                        return (
                        <tr key={session.id} className={`border-b ${rowBgColor}`}>
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {sessionIndex + 1}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {session.first_name} {session.last_name}
                          </td>
                          <td className="px-4 py-2">{session.email}</td>
                          <td className="px-4 py-2">{session.phone}</td>
                          <td className="px-4 py-2">{session.zip_code}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                              isMorning ? 'bg-blue-200 text-blue-900' : 'bg-green-200 text-green-900'
                            }`}>
                              {session.time_slot}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(session.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.assigned_recruiter_name ? (
                              <a
                                href={`/recruiter/${session.assigned_recruiter_id}/dashboard`}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                {session.assigned_recruiter_name}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                              session.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : session.status === 'in-progress' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : session.status === 'initiated'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.status === 'completed' ? '✓ Completed' : session.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.is_in_exclusion_list && session.exclusion_match ? (
                              <div className="bg-red-100 border-2 border-red-500 rounded p-2 text-red-800">
                                <div className="font-bold text-sm mb-1">⚠️ POSIBLE PC o RR</div>
                                <div className="text-xs space-y-1">
                                  <div><strong>Name:</strong> {session.exclusion_match.name}</div>
                                  {session.exclusion_match.code && (
                                    <div><strong>Code:</strong> {session.exclusion_match.code}</div>
                                  )}
                                  {session.exclusion_match.ssn && (
                                    <div><strong>SSN:</strong> {session.exclusion_match.ssn}</div>
                                  )}
                                </div>
                              </div>
                            ) : session.is_in_exclusion_list ? (
                              <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-bold text-xs">
                                ⚠️ Possible PC/RR
                              </span>
                            ) : null}
                          </td>
                        </tr>
                        )
                      })}
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
                  <th className="px-4 py-2 text-left">Assigned Recruiter</th>
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
                          <td colSpan={8} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
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
                            {orientation.assigned_recruiter_name ? (
                              <a
                                href={`/recruiter/${orientation.assigned_recruiter_id}/dashboard`}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {orientation.assigned_recruiter_name}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
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

  const renderGenericTable = (data: any[], fields: string[]) => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    if (data.length === 0) {
      return <p className="text-center py-8 text-gray-500">No records found</p>
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              {fields.map((field) => (
                <th key={field} className="px-4 py-2 text-left capitalize">
                  {field.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b">
                {fields.map((field) => (
                  <td key={field} className="px-4 py-2">
                    {item[field] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
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
        process_status: selectedOrientation.process_status || null,
        badge_status: selectedOrientation.badge_status || 'pending',
        missing_steps: selectedOrientation.missing_steps || null
      })
      await loadData()
      setSelectedOrientation(null)
      alert('Orientation details updated!')
    } catch (error) {
      console.error('Error saving orientation details:', error)
      alert('Error saving orientation details')
    }
  }

  const renderMyVisits = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    const unreadVisits = myVisits.filter(v => v.status === 'pending')
    
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
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-800 font-bold">👥 My Visits</p>
        </div>
        {unreadVisits.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-800 font-bold">
              🔔 You have {unreadVisits.length} new visit{unreadVisits.length > 1 ? 's' : ''}!
            </p>
          </div>
        )}
        {myVisits.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No visits assigned to you</p>
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
                                    loadData()
                                  } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold">Management Dashboard</h1>
                {currentUser && (
                  <p className="text-gray-600">Welcome, {currentUser.full_name}</p>
                )}
              </div>
              {refreshing && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/staff/login'
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('info-session')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'info-session'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Info Session (Live)
            </button>
            <button
              onClick={() => setActiveTab('new-hire-orientation')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'new-hire-orientation'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👔 New Hire Orientation
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'badges'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🪪 Badges
            </button>
            <button
              onClick={() => setActiveTab('fingerprints')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'fingerprints'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👆 Fingerprints
            </button>
            <button
              onClick={() => setActiveTab('my-visits')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'my-visits'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
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
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 CHR
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'event'
                  ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎟️ Event
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'info-session' && renderInfoSessionLive()}
          {activeTab === 'new-hire-orientation' && renderNewHireOrientations()}
          {activeTab === 'badges' && renderBadges()}
          {activeTab === 'fingerprints' && renderFingerprints()}
          {activeTab === 'my-visits' && renderMyVisits()}
          {activeTab === 'statistics' && <StatisticsDashboard />}
          {activeTab === 'chr' && <CHRPage />}
          {activeTab === 'event' && <EventManagement />}
        </div>
      </div>

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
  )
}

export default ManagementDashboard
