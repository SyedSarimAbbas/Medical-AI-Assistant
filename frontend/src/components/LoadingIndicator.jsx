/**
 * Loading spinner shown while waiting for AI response.
 * Includes accessibility attributes for screen readers.
 */
export default function LoadingIndicator() {
  return (
    <div
      className="flex justify-start mb-4"
      role="status"
      aria-live="polite"
      aria-label="Loading AI response..."
    >
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span
            className="w-2 h-2 rounded-full bg-medical-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
            aria-hidden="true"
          />
          <span
            className="w-2 h-2 rounded-full bg-medical-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
            aria-hidden="true"
          />
          <span
            className="w-2 h-2 rounded-full bg-medical-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
