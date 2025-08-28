import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

const EmptyState = ({ icon, title, description, action, className = '', compact = false }: EmptyStateProps) => {
  return (
    <div className={`text-center ${compact ? 'py-4' : 'py-8 sm:py-12'} ${className}`}>
      <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12 sm:w-16 sm:h-16'} mx-auto mb-4 text-gray-300 flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className={`${compact ? 'text-sm' : 'text-sm sm:text-base'} font-semibold text-gray-700 mb-2`}>{title}</h3>
      <p className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-500 mb-4 px-4`}>{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState