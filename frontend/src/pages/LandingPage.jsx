import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Header from '../components/Header'
import Footer from '../components/Footer'

/**
 * Landing page with app description and "Start Chat" button.
 * Mobile-responsive layout.
 */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Medical AI Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ask general health questions and get AI-generated responses. This tool provides
            informational support only—always consult a healthcare professional for medical advice.
          </p>
          <Button onClick={() => navigate('/login')} variant="primary">
            Start Chat
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
