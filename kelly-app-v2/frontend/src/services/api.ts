import axios from 'axios'
import type { InfoSessionRegistration, InfoSessionWithSteps, Announcement, CHRCase, CHRDashboardStats, CHRStatusBreakdown, NewHireOrientationRegistration, NewHireOrientationWithSteps } from '../types'

// Detectar automáticamente la URL del backend basándose en la URL actual
// Si se accede desde localhost, usa localhost. Si se accede desde una IP, usa esa IP.
function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL
  if (envUrl) {
    return envUrl
  }
  
  // Si no hay VITE_API_URL configurado, detectar automáticamente
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Si es localhost o 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3026/api'
  }
  
  // Si se accede desde una IP o dominio, usar esa misma IP/dominio para el backend
  // Asumimos que el backend está en el mismo host pero puerto 3026
  return `${protocol}//${hostname}:3026/api`
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for statistics queries
})

export default api

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend may not be running')
      return Promise.reject(new Error('Backend server is not responding. Please make sure the backend is running on port 3026.'))
    }
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network error - Backend may not be running')
      return Promise.reject(new Error('Cannot connect to backend server. Please make sure the backend is running on port 3026.'))
    }
    return Promise.reject(error)
  }
)

export const registerInfoSession = async (
  data: InfoSessionRegistration
): Promise<InfoSessionWithSteps> => {
  const response = await api.post('/info-session/register', data)
  return response.data
}

export const getInfoSession = async (id: number): Promise<InfoSessionWithSteps> => {
  const response = await api.get(`/info-session/${id}`)
  return response.data
}

export const completeStep = async (sessionId: number, stepName: string): Promise<void> => {
  await api.patch(`/info-session/${sessionId}/steps/${stepName}/complete`)
}

export const completeInfoSession = async (sessionId: number): Promise<{ message: string; session_id: number }> => {
  const response = await api.post(`/info-session/${sessionId}/complete`)
  return response.data
}

export const updateInterviewQuestions = async (
  sessionId: number,
  questions: {
    question_1_response?: string
    question_2_response?: string
    question_3_response?: string
    question_4_response?: string
  }
): Promise<{ message: string; session_id: number }> => {
  const response = await api.patch(`/info-session/${sessionId}/interview-questions`, questions)
  return response.data
}

export const downloadAnswersPDF = async (sessionId: number): Promise<Blob> => {
  const response = await api.get(`/info-session/${sessionId}/answers-pdf`, {
    responseType: 'blob'
  })
  return response.data
}

export const checkExclusion = async (
  firstName: string,
  lastName: string
): Promise<{
  is_in_exclusion_list: boolean
  matches: Array<{ id: number; name: string; code: string | null; ssn: string | null; dob: string | null; notes: string | null }>
  warning_message: string | null
}> => {
  try {
    // URL encode the names to handle special characters
    const encodedFirstName = encodeURIComponent(firstName)
    const encodedLastName = encodeURIComponent(lastName)
    const response = await api.get(`/info-session/exclusion-check/${encodedFirstName}/${encodedLastName}`)
    return response.data
  } catch (error: any) {
    console.error('Error checking exclusion:', error)
    // Return a safe default response if there's an error
    return {
      is_in_exclusion_list: false,
      matches: [],
      warning_message: null
    }
  }
}

export const getAnnouncements = async (activeOnly: boolean = true): Promise<Announcement[]> => {
  const response = await api.get('/announcements/', { params: { active_only: activeOnly } })
  return response.data
}

export const getInfoSessions = async (): Promise<InfoSessionWithSteps[]> => {
  const response = await api.get('/info-session/')
  return response.data
}

export const getAvailableTimeSlots = async (): Promise<string[]> => {
  const response = await api.get('/info-session-config/time-slots')
  return response.data
}

// New Hire Orientation API
export const registerNewHireOrientation = async (
  data: NewHireOrientationRegistration
): Promise<NewHireOrientationWithSteps> => {
  const response = await api.post('/new-hire-orientation/register', data)
  return response.data
}

export const getNewHireOrientation = async (id: number): Promise<NewHireOrientationWithSteps> => {
  const response = await api.get(`/new-hire-orientation/${id}`)
  return response.data
}

export const completeNewHireOrientationStep = async (orientationId: number, stepName: string): Promise<void> => {
  await api.patch(`/new-hire-orientation/${orientationId}/steps/${stepName}/complete`)
}

export const completeNewHireOrientation = async (orientationId: number): Promise<{ message: string; orientation_id: number }> => {
  const response = await api.post(`/new-hire-orientation/${orientationId}/complete`)
  return response.data
}

export const getNewHireOrientationTimeSlots = async (): Promise<string[]> => {
  const response = await api.get('/new-hire-orientation/time-slots')
  return response.data
}

export const getNewHireOrientations = async (): Promise<NewHireOrientation[]> => {
  const response = await api.get('/new-hire-orientation/')
  return response.data
}

export const updateNewHireOrientation = async (
  orientationId: number,
  updateData: {
    process_status?: string | null
    badge_status?: string | null
    missing_steps?: string | null
    status?: string | null
  }
): Promise<NewHireOrientation> => {
  const response = await api.patch(`/new-hire-orientation/${orientationId}`, updateData)
  return response.data
}

export const getInfoSessionConfig = async (): Promise<{
  id: number
  max_sessions_per_day: number
  time_slots: string[]
  is_active: boolean
}> => {
  const response = await api.get('/info-session-config/')
  return response.data
}

export const updateInfoSessionConfig = async (config: {
  max_sessions_per_day: number
  time_slots: string[]
  is_active?: boolean
}): Promise<void> => {
  await api.put('/info-session-config/', config)
}

// New Hire Orientation Config API
export interface StepConfig {
  step_name: string
  step_description: string
}

export const getNewHireOrientationConfig = async (): Promise<{
  id: number
  max_sessions_per_day: number
  time_slots: string[]
  steps?: StepConfig[]
  is_active: boolean
}> => {
  const response = await api.get('/new-hire-orientation-config/')
  return response.data
}

export const updateNewHireOrientationConfig = async (config: {
  max_sessions_per_day: number
  time_slots: string[]
  is_active?: boolean
}): Promise<void> => {
  await api.put('/new-hire-orientation-config/', config)
}


// Recruiter API
export const getRecruiterStatus = async (recruiterId: number): Promise<{
  id: number
  name: string
  email: string
  is_active: boolean
  status: 'available' | 'busy'
}> => {
  const response = await api.get(`/recruiter/${recruiterId}/status`)
  return response.data
}

export const updateRecruiterStatus = async (
  recruiterId: number,
  status: 'available' | 'busy'
): Promise<void> => {
  await api.patch(`/recruiter/${recruiterId}/status`, { status })
}

export const getAssignedSessions = async (
  recruiterId: number,
  status?: string
): Promise<{
  sessions: Array<{
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    zip_code: string
    session_type: string
    time_slot: string
    status: string
    ob365_sent: boolean
    i9_sent: boolean
    existing_i9: boolean
    ineligible: boolean
    rejected: boolean
    drug_screen: boolean
    questions: boolean
    started_at: string | null
    completed_at: string | null
    duration_minutes: number | null
    created_at: string
  }>
  count: number
}> => {
  const params = status ? { status } : {}
  const response = await api.get(`/recruiter/${recruiterId}/assigned-sessions`, { params })
  return response.data
}

export const startSession = async (recruiterId: number, sessionId: number): Promise<{ message: string; started_at: string; generated_row?: string }> => {
  const response = await api.post(`/recruiter/${recruiterId}/sessions/${sessionId}/start`)
  return response.data
}

export const completeSession = async (
  recruiterId: number,
  sessionId: number,
  updateData: {
    ob365_sent?: boolean
    i9_sent?: boolean
    existing_i9?: boolean
    ineligible?: boolean
    rejected?: boolean
    drug_screen?: boolean
    questions?: boolean
  }
): Promise<{
  message: string
  completed_at: string | null
  duration_minutes: number | null
}> => {
  const response = await api.post(`/recruiter/${recruiterId}/sessions/${sessionId}/complete`, {
    ...updateData,
    status: 'completed',
  })
  return response.data
}

export const updateSessionDocuments = async (
  recruiterId: number,
  sessionId: number,
  updateData: {
    ob365_sent?: boolean
    i9_sent?: boolean
    existing_i9?: boolean
    ineligible?: boolean
    rejected?: boolean
    drug_screen?: boolean
    questions?: boolean
    generated_row?: string
    status?: string
  }
): Promise<void> => {
  await api.patch(`/recruiter/${recruiterId}/sessions/${sessionId}/update`, updateData)
}

export const getRecruiterByEmail = async (email: string): Promise<{
  id: number
  name: string
  email: string
  is_active: boolean
  status: string
}> => {
  const response = await api.get(`/recruiter/by-email/${encodeURIComponent(email)}`)
  return response.data
}

// CHR API
export const getCHRCases = async (): Promise<CHRCase[]> => {
  const response = await api.get('/chr/')
  return response.data
}

export const getCHRCase = async (id: number): Promise<CHRCase> => {
  const response = await api.get(`/chr/${id}`)
  return response.data
}

export const createCHRCase = async (data: {
  candidate_full_name: string
  bullhorn_id?: string
  ssn?: string
  dob?: string
  info_requested_sent_date?: string
  submitted_to_district?: string
  submission_date?: string
  district_notified?: string
  current_status?: string
  final_decision?: string
  notes?: string
}): Promise<CHRCase> => {
  const response = await api.post('/chr/', data)
  return response.data
}

export const updateCHRCase = async (
  id: number,
  data: {
    candidate_full_name?: string
    bullhorn_id?: string
    ssn?: string
    dob?: string
    info_requested_sent_date?: string
    submitted_to_district?: string
    submission_date?: string
    district_notified?: string
    current_status?: string
    final_decision?: string
    notes?: string
  }
): Promise<CHRCase> => {
  const response = await api.patch(`/chr/${id}`, data)
  return response.data
}

export const deleteCHRCase = async (id: number): Promise<void> => {
  await api.delete(`/chr/${id}`)
}

export const getCHRDashboardStats = async (): Promise<CHRDashboardStats> => {
  const response = await api.get('/chr/dashboard/stats')
  return response.data
}

export const getCHRStatusBreakdown = async (): Promise<CHRStatusBreakdown> => {
  const response = await api.get('/chr/dashboard/status-breakdown')
  return response.data
}

// Auth API
export const login = async (email: string, password: string): Promise<{
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string
    role: string
    is_active: boolean
  }
}> => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

// getCurrentUser is defined below in Visits API section

export const getUsers = async (): Promise<Array<{
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}>> => {
  // Use the interceptor, no need to add token manually
  const response = await api.get('/auth/users')
  return response.data
}

export const createUser = async (userData: {
  email: string
  password: string
  full_name: string
  role: string
}): Promise<{
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}> => {
  // Use the interceptor, no need to add token manually
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const deleteUser = async (userId: number): Promise<void> => {
  // Use the interceptor, no need to add token manually
  await api.delete(`/auth/users/${userId}`)
}

// Visits API
export const getLiveInfoSessions = async (): Promise<InfoSessionWithSteps[]> => {
  const response = await api.get('/info-session/live')
  return response.data
}

export const getCompletedInfoSessions = async (): Promise<InfoSessionWithSteps[]> => {
  const response = await api.get('/info-session/completed')
  return response.data
}


export const getBadges = async (): Promise<any[]> => {
  const response = await api.get('/visits/badges')
  return response.data
}

export const registerBadge = async (data: {
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code?: string
  appointment_time: string
}): Promise<any> => {
  const response = await api.post('/visits/badges', data)
  return response.data
}

export const getFingerprints = async (): Promise<any[]> => {
  const response = await api.get('/visits/fingerprints')
  return response.data
}

export const registerFingerprint = async (data: {
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code?: string
  appointment_time: string
  fingerprint_type: string
}): Promise<any> => {
  const response = await api.post('/visits/fingerprints', data)
  return response.data
}

export const getMyVisits = async (): Promise<any[]> => {
  const response = await api.get('/visits/team-visit/my-visits')
  return response.data
}

export const getStaffMembers = async (): Promise<Array<{ id: number; name: string; email: string }>> => {
  const response = await api.get('/visits/team-visit/staff-members')
  return response.data
}

export const registerTeamVisit = async (data: {
  first_name: string
  last_name: string
  email: string
  phone: string
  team_member_id: number | null
  reason: string
}): Promise<any> => {
  const response = await api.post('/visits/team-visit', data)
  return response.data
}

// Statistics API
export interface StatisticsData {
  total_info_sessions: number
  total_new_hire_orientations: number
  total_visits: number
  total_badges: number
  total_fingerprints: number
  info_sessions_by_status: Record<string, number>
  new_hire_orientations_by_status: Record<string, number>
  visits_by_status: Record<string, number>
  average_completion_time_info_sessions: number | null
  average_completion_time_new_hire: number | null
  daily_stats: Array<{
    date: string
    info_sessions: number
    new_hire_orientations: number
    visits: number
    badges: number
    fingerprints: number
    total: number
  }>
  weekly_stats: Array<{
    week_start: string
    week_end: string
    info_sessions: number
    new_hire_orientations: number
    visits: number
    badges: number
    fingerprints: number
    total: number
  }>
  monthly_stats: Array<{
    month: string
    month_start: string
    month_end: string
    info_sessions: number
    new_hire_orientations: number
    visits: number
    badges: number
    fingerprints: number
    total: number
  }>
  heatmap_data: Array<{
    date: string
    value: number
    info_sessions: number
    new_hire_orientations: number
    visits: number
    badges: number
    fingerprints: number
  }>
  time_slot_distribution: Record<string, number>
  recruiter_performance: Array<{
    recruiter_id: number
    recruiter_name: string
    assigned_sessions: number
    completed_sessions: number
    completion_rate: number
  }>
}

export const getStatistics = async (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'): Promise<StatisticsData> => {
  const response = await api.get(`/statistics/?period=${period}`)
  return response.data
}

export const createStatisticsBackup = async (): Promise<{ message: string; backup_file: string; timestamp: string }> => {
  const response = await api.post('/statistics/backup')
  return response.data
}

export const notifyTeamVisit = async (visitId: number): Promise<void> => {
  await api.patch(`/visits/team-visit/${visitId}/notify`)
}

export const getCurrentUser = async (): Promise<any> => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Not authenticated')
  }
  // Use the interceptor, no need to add token manually
  const response = await api.get('/auth/me')
  return response.data
}

// Exclusion List API
export const uploadExclusionList = async (file: File): Promise<{
  message: string
  added: number
  errors?: string[] | null
}> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/exclusion-list/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getExclusionList = async (): Promise<{
  items: any[]
  total: number
}> => {
  const response = await api.get('/exclusion-list/list')
  return response.data
}

export const clearExclusionList = async (): Promise<{
  message: string
}> => {
  const response = await api.delete('/exclusion-list/clear')
  return response.data
}

// Row Template API
export interface ColumnDefinition {
  id?: number
  template_id?: number
  order: number
  name: string
  column_type: 'text' | 'dropdown' | 'note' | 'date' | 'number'
  placeholder?: string | null
  options?: string[] | null
  is_required: boolean
  default_value?: string | null
  notes?: string | null
}

export interface RowTemplate {
  id: number
  name: string
  description?: string | null
  is_active: boolean
  columns: ColumnDefinition[]
  created_at: string
  updated_at?: string | null
}

export const getRowTemplates = async (activeOnly: boolean = false): Promise<RowTemplate[]> => {
  const response = await api.get('/row-template/', { params: { active_only: activeOnly } })
  return response.data
}

export const getRowTemplate = async (templateId: number): Promise<RowTemplate> => {
  const response = await api.get(`/row-template/${templateId}`)
  return response.data
}

export const createRowTemplate = async (template: {
  name: string
  description?: string
  columns: ColumnDefinition[]
  is_active?: boolean
}): Promise<RowTemplate> => {
  const response = await api.post('/row-template/', template)
  return response.data
}

export const updateRowTemplate = async (
  templateId: number,
  template: {
    name?: string
    description?: string
    columns?: ColumnDefinition[]
    is_active?: boolean
  }
): Promise<RowTemplate> => {
  const response = await api.put(`/row-template/${templateId}`, template)
  return response.data
}

export const deleteRowTemplate = async (templateId: number): Promise<void> => {
  await api.delete(`/row-template/${templateId}`)
}

export const generateRow = async (templateId: number, data: Record<string, any>): Promise<{
  row_text: string
  row_array: string[]
}> => {
  const response = await api.post('/row-template/generate-row', {
    template_id: templateId,
    data
  })
  return response.data
}

