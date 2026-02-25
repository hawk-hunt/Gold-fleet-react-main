/**
 * PageHeader Component
 * Consistent page header with title, description, and action buttons
 * Props:
 *   title - page title
 *   description - optional page description
 *   icon - optional icon
 *   actions - optional array of action buttons: { label, onClick, primary, ...rest }
 *   backButton - optional back navigation
 */
export default function PageHeader({
  title,
  description,
  icon,
  actions = [],
  backButton,
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Back button if provided */}
      {backButton && (
        <button
          onClick={backButton.onClick}
          className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">{backButton.label || 'Back'}</span>
        </button>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start space-x-4">
          {icon && <div className="text-3xl mt-1">{icon}</div>}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{title}</h1>
            {description && (
              <p className="mt-1 text-gray-600 text-sm sm:text-base">{description}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
                  ${
                    action.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }
                  ${action.className || ''}
                `}
                {...action.rest}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
