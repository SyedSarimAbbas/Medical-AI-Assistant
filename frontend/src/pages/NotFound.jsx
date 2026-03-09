import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Header from '../components/Header'
import Footer from '../components/Footer'

/**
 * 404 Not Found page displayed for invalid routes.
 */
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-medical-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist. Let's get you back to the chat.
          </p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go Back Home
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
