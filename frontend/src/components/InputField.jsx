/**
 * Reusable text input component with validation feedback.
 * @param {Object} props - {value, onChange, placeholder, disabled, label, error, maxLength}
 */
export default function InputField({
  value = '',
  onChange,
  placeholder = 'Type your message...',
  disabled = false,
  label,
  error,
  maxLength,
  type = 'text',
}) {
  const handleChange = (e) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return
    }
    onChange(newValue)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? 'input-error' : undefined}
      />
      {error && (
        <p id="input-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
