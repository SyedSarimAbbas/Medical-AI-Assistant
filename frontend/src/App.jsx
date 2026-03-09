import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import NotFound from './pages/NotFound'
import { isAuthenticated } from './services/auth'

/**
 * Wrapper that redirects to /login if the user is not authenticated.
 */
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

/**
 * Main app component with routing and error handling.
 * - LandingPage: intro and "Start Chat" button
 * - LoginPage: login form, JWT stored and redirect to /chat
 * - ChatPage: protected chat interface
 * - NotFound: 404 for invalid routes
 */
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
