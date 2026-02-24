import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterVisitPage from './pages/RegisterVisitPage'
import InfoSessionPage from './pages/InfoSessionPage'
import NewHireOrientationPage from './pages/NewHireOrientationPage'
import FingerprintPage from './pages/FingerprintPage'
import BadgePage from './pages/BadgePage'
import TeamVisitPage from './pages/TeamVisitPage'
import StaffLoginPage from './pages/StaffLoginPage'
import StaffDashboard from './pages/StaffDashboard'
import ManagementDashboard from './pages/ManagementDashboard'
import FrontdeskDashboard from './pages/FrontdeskDashboard'
import TalentDashboard from './pages/TalentDashboard'
import UserDashboard from './pages/UserDashboard'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminInfoSessionConfig from './pages/AdminInfoSessionConfig'
import AdminConfigurations from './pages/AdminConfigurations'
import AdminRowGenerator from './pages/AdminRowGenerator'
import RecruiterDashboard from './pages/RecruiterDashboard'
import EventRegistrationPage from './pages/EventRegistrationPage'
import InfoSessionQuestionsPage from './pages/InfoSessionQuestionsPage'
import './index.css'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-visit" element={<RegisterVisitPage />} />
        <Route path="/info-session" element={<InfoSessionPage />} />
        <Route path="/new-hire-orientation" element={<NewHireOrientationPage />} />
        <Route path="/fingerprints" element={<FingerprintPage />} />
        <Route path="/badges" element={<BadgePage />} />
        <Route path="/team-visit" element={<TeamVisitPage />} />
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/management/dashboard" element={<ManagementDashboard />} />
        <Route path="/frontdesk/dashboard" element={<FrontdeskDashboard />} />
        <Route path="/talent/dashboard" element={<TalentDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/info-session-config" element={<AdminInfoSessionConfig />} />
        <Route path="/admin/configurations" element={<AdminConfigurations />} />
        <Route path="/admin/row-generator" element={<AdminRowGenerator />} />
        <Route path="/recruiter/:recruiterId/dashboard" element={<RecruiterDashboard />} />
        <Route path="/event/:unique_code/register" element={<EventRegistrationPage />} />
        <Route path="/info-session/:sessionId/questions" element={<InfoSessionQuestionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

