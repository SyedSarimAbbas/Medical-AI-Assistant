/**
 * App footer with disclaimer and important legal notice.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 space-y-3">
          <p className="font-semibold text-gray-700">
            ⚕️ Medical Disclaimer
          </p>
          <p>
            This AI assistant provides general health information only. It is <strong>not a substitute</strong> for
            professional medical advice, diagnosis, or treatment. Always consult a qualified
            healthcare provider before making any medical decisions.
          </p>
          <p className="text-xs text-gray-500">
            © {currentYear} Medical AI Assistant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
