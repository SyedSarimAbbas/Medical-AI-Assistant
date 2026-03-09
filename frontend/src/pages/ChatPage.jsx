import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendChatMessage } from '../services/api'
import { clearToken } from '../services/auth'
import Button from '../components/Button'
import InputField from '../components/InputField'
import Message from '../components/Message'
import LoadingIndicator from '../components/LoadingIndicator'
import Header from '../components/Header'
import Footer from '../components/Footer'

/**
 * Chat page with message list, input, and AI responses.
 * Features: auto-scroll, error handling, message export, character counter
 */
export default function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const maxLength = 1000
  const charCount = input.length

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => scrollToBottom(), [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    
    // Validation
    if (!trimmed) {
      setError('Please enter a message.')
      return
    }
    if (trimmed.length < 3) {
      setError('Message must be at least 3 characters.')
      return
    }
    if (trimmed.length > maxLength) {
      setError(`Message must be ${maxLength} characters or less.`)
      return
    }

    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChatMessage(trimmed, messages)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, blocked: data.blocked },
      ])
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1))
      if (err.message === 'UNAUTHORIZED') {
        clearToken()
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'Failed to get response. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Export chat history as plain text file
   */
  const exportChat = () => {
    if (messages.length === 0) {
      setError('No messages to export.')
      return
    }
    
    const lines = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medical-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-[200px]">
          {messages.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">
              Send a message to start the conversation.
            </p>
          )}
          {messages.map((msg, i) => (
            <Message
              key={i}
              role={msg.role}
              content={msg.content}
              isBlocked={msg.blocked}
            />
          ))}
          {loading && (
            <div>
              <LoadingIndicator />
              <p className="text-center text-sm text-gray-500 mt-2">
                AI is thinking... (this may take 20-60 seconds)
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <InputField
              value={input}
              onChange={setInput}
              placeholder="Type your medical question..."
              disabled={loading}
            />
            <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
              <span></span>
              <span className={charCount > maxLength ? 'text-red-600' : ''}>
                {charCount} / {maxLength}
              </span>
            </div>
          </div>
          <Button type="submit" disabled={loading || charCount === 0 || charCount > maxLength}>
            {loading ? 'Thinking...' : 'Send'}
          </Button>
        </form>

        {/* Export button */}
        {messages.length > 0 && (
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="secondary" onClick={exportChat}>
              📥 Export Chat
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
