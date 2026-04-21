import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import StartInterviewPage from './pages/StartInterviewPage'
import InterviewScreenPage from './pages/InterviewScreenPage'
import FeedbackPage from './pages/FeedbackPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/start-interview"
            element={
              <ProtectedRoute>
                <StartInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:interviewId"
            element={
              <ProtectedRoute>
                <InterviewScreenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback/:interviewId"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600 mt-2">Page not found</p>
      </div>
    </div>
  )
}

export default App
