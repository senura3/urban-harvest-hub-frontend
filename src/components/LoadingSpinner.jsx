import React from 'react'

export const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <div className={`${sizeClasses[size]} border-stone-200 border-t-harvest rounded-full animate-spin`}></div>
      {message && (
        <p className="mt-4 text-stone-600 dark:text-stone-400 font-medium text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
