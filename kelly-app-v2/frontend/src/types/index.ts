export interface InfoSessionRegistration {
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  session_type: 'new-hire' | 'reactivation'
  time_slot: string
}

export interface InfoSessionStep {
  step_name: string
  step_description: string
  is_completed: boolean
}

export interface ExclusionMatchInfo {
  name: string
  code?: string | null
  ssn?: string | null
}

export interface InfoSession {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  session_type: string
  time_slot: string
  is_in_exclusion_list: boolean
  exclusion_warning_shown: boolean
  exclusion_match?: ExclusionMatchInfo | null
  status: string
  ob365_sent?: boolean
  i9_sent?: boolean
  existing_i9?: boolean
  ineligible?: boolean
  rejected?: boolean
  drug_screen?: boolean
  questions?: boolean
  assigned_recruiter_id?: number | null
  assigned_recruiter_name?: string | null
  started_at?: string | null
  completed_at?: string | null
  duration_minutes?: number | null
  question_1_response?: string | null
  question_2_response?: string | null
  question_3_response?: string | null
  question_4_response?: string | null
  created_at: string
}

export interface InfoSessionWithSteps extends InfoSession {
  steps: InfoSessionStep[]
}

export interface NewHireOrientationRegistration {
  first_name: string
  last_name: string
  email: string
  phone: string
  time_slot: string
}

export interface NewHireOrientationStep {
  step_name: string
  step_description: string
  is_completed: boolean
}

export interface NewHireOrientation {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  time_slot: string
  status: string
  assigned_recruiter_id?: number | null
  assigned_recruiter_name?: string | null
  process_status?: string | null
  badge_status?: string | null
  missing_steps?: string | null
  started_at?: string | null
  completed_at?: string | null
  duration_minutes?: number | null
  created_at: string
}

export interface NewHireOrientationWithSteps extends NewHireOrientation {
  steps: NewHireOrientationStep[]
}

export interface Announcement {
  id: number
  title: string
  message: string
  is_active: boolean
  display_order: number
}

export interface Recruiter {
  id: number
  name: string
  email: string
  is_active: boolean
  status: 'available' | 'busy'
}

export interface AssignedSession {
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
  generated_row: string | null
  assigned_recruiter_id?: number | null
  assigned_recruiter_name?: string | null
}

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export interface CHRCase {
  id: number
  candidate_full_name: string
  bullhorn_id?: string | null
  ssn?: string | null
  dob?: string | null
  info_requested_sent_date?: string | null
  deadline?: string | null
  submitted_to_district?: string | null
  submission_date?: string | null
  district_notified?: string | null
  current_status?: string | null
  final_decision?: string | null
  notes?: string | null
  days_since_review?: number | null
  created_at: string
  updated_at?: string | null
}

export interface CHRDashboardStats {
  total_cases: number
  open_cases: number
  overdue: number
  approved: number
  denied: number
  pending_decision: number
}

export interface CHRStatusBreakdown {
  waiting_documents: number
  in_review: number
  approved: number
  rejected: number
  not_approved: number
  pending: number
}

export interface Event {
  id: number
  name: string
  unique_code: string
  qr_code_data?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
  attendee_count?: number
}

export interface EventAttendee {
  id: number
  event_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  english_communication: boolean
  education_proof: boolean
  assigned_recruiter_id?: number | null
  assigned_recruiter_name?: string | null
  is_duplicate: boolean
  is_checked: boolean
  created_at: string
}

export interface EventAttendeeCreate {
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  english_communication: boolean
  education_proof: boolean
}

export interface RecruiterList {
  recruiter_id: number
  recruiter_name: string
  attendees: EventAttendee[]
}



