import { useNavigate } from 'react-router-dom'
import { isAuthenticated, clearToken } from '../services/auth'

/**
 * App header with logo and optional logout link when authenticated.
 */
export default function Header() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  const handleLogout = (e) => {
    e.preventDefault()
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold text-medical-600 hover:text-medical-700">
          Medical AI Assistant
        </a>
        {authenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  )
}
