import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Loading Spinner Component
 * Displays a centered loading spinner with optional message
 */
const LoadingSpinner = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  inline = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const iconSize = {
    small: 16,
    medium: 32,
    large: 48,
    xlarge: 64
  };

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2">
        <Loader className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`} size={iconSize[size]} />
        {message && <span className="text-gray-600 dark:text-gray-400 text-sm">{message}</span>}
      </div>
    );
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-950 z-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <Loader className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`} size={iconSize[size]} />
        {message && (
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
