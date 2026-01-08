import React from 'react';
import { Inbox, Plus, RefreshCw } from 'lucide-react';

/**
 * Empty State Component
 * Displays when there's no data to show
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showRefresh = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
          >
            <Plus size={20} />
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
          >
            {secondaryActionLabel}
          </button>
        )}

        {showRefresh && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
