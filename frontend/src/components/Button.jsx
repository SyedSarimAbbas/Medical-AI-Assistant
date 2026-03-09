/**
 * Reusable button component with multiple variants.
 * @param {Object} props - {children, onClick, variant, disabled, className, type}
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) {
  const base =
    'px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-medical-600 text-white hover:bg-medical-700 focus:ring-medical-500 active:bg-medical-800',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400',
    outline:
      'border-2 border-medical-600 text-medical-600 hover:bg-medical-50 focus:ring-medical-500 active:bg-medical-100',
  }

  const styles = `${base} ${variants[variant] || variants.primary} ${className}`

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}
