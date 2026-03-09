import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../services/api'
import { setToken } from '../services/auth'
import Button from '../components/Button'
import InputField from '../components/InputField'
import Header from '../components/Header'
import Footer from '../components/Footer'

/**
 * Login/Registration page: allows users to sign in or create a new account.
 * On successful login, stores JWT and redirects to /chat.
 * On successful registration, redirects to login form.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Shared state
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration state
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  /**
   * Handle login form submission
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    const u = username.trim()
    const p = password
    
    if (!u || !p) {
      setError('Please enter username and password.')
      return
    }
    if (u.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (p.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const data = await login(u, p)
      setToken(data.access_token)
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle registration form submission
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    const u = regUsername.trim()
    const em = regEmail.trim()
    const p = regPassword
    const pc = regConfirmPassword
    
    // Validation
    if (!u || !em || !p || !pc) {
      setError('All fields are required.')
      return
    }
    if (u.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (u.length > 50) {
      setError('Username must not exceed 50 characters.')
      return
    }
    if (!em.includes('@') || !em.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    if (p.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (p !== pc) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const data = await register(u, em, p)
      setSuccess(`Welcome ${data.username}! Registration successful. Redirecting to login...`)
      
      // Reset forms
      setRegUsername('')
      setRegEmail('')
      setRegPassword('')
      setRegConfirmPassword('')
      setUsername('')
      setPassword('')
      
      // Switch to login mode and prefill username after 2 seconds
      setTimeout(() => {
        setUsername(u)
        setIsRegistering(false)
        setSuccess(null)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {!isRegistering ? (
            // LOGIN FORM
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Sign in</h1>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Sign in to use the Medical AI Assistant chat.
              </p>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <InputField
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="Username"
                  disabled={loading}
                />
                <InputField
                  type="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  disabled={loading}
                />
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    {success}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Don't have an account?
                </p>
                <Button
                  onClick={() => {
                    setIsRegistering(true)
                    setError(null)
                    setSuccess(null)
                  }}
                  disabled={loading}
                  className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Create new account
                </Button>
              </div>
              
              <p className="mt-4 text-center text-sm text-gray-500">
                Demo: username <strong>demo</strong>, password <strong>demo123</strong>
              </p>
            </>
          ) : (
            // REGISTRATION FORM
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create account</h1>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Register to start using the Medical AI Assistant.
              </p>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <InputField
                  label="Username"
                  value={regUsername}
                  onChange={setRegUsername}
                  placeholder="Username (3-50 characters)"
                  disabled={loading}
                />
                <InputField
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={setRegEmail}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                <InputField
                  type="password"
                  label="Password"
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="Password (minimum 8 characters)"
                  disabled={loading}
                />
                <InputField
                  type="password"
                  label="Confirm Password"
                  value={regConfirmPassword}
                  onChange={setRegConfirmPassword}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    {success}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Already have an account?
                </p>
                <Button
                  onClick={() => {
                    setIsRegistering(false)
                    setError(null)
                    setSuccess(null)
                  }}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Back to sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
