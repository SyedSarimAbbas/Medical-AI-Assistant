/**
 * Single chat message bubble (user or assistant).
 * Handles blocked messages, text wrapping, and proper styling.
 * @param {Object} props - {role, content, isBlocked}
 */
export default function Message({ role, content, isBlocked = false }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-medical-600 text-white rounded-br-md'
            : `${isBlocked ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-200'} text-gray-800 rounded-bl-md shadow-sm`
        }`}
      >
        {isBlocked && (
          <div className="mb-2 text-amber-700 text-sm font-medium flex items-center gap-1">
            <span aria-hidden="true" role="img">⚠️</span>
            <span>Safety notice</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
          {content || '(Empty message)'}
        </p>
      </div>
    </div>
  )
}
