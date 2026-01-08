import React from 'react';

/**
 * Skeleton Loader Component
 * Displays animated placeholder content while data is loading
 */

// Base skeleton element with shimmer animation
export const SkeletonBase = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div
    className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
  />
);

// Skeleton for table rows
export const SkeletonTableRow = ({ columns = 6 }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-3">
        <SkeletonBase height={index === 0 ? 'h-5' : 'h-4'} />
      </td>
    ))}
  </tr>
);

// Skeleton for table
export const SkeletonTable = ({ rows = 5, columns = 6 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {/* Table Header Skeleton */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-4 py-3">
      <SkeletonBase width="w-32" height="h-6" className="bg-blue-400 dark:bg-blue-600" />
    </div>

    {/* Table Content Skeleton */}
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <SkeletonBase height="h-4" width="w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <SkeletonTableRow key={rowIndex} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Skeleton for cards
export const SkeletonCard = ({ hasImage = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
    {hasImage && (
      <SkeletonBase width="w-full" height="h-48" className="rounded-lg" />
    )}
    <SkeletonBase width="w-3/4" height="h-6" />
    <SkeletonBase width="w-full" height="h-4" />
    <SkeletonBase width="w-5/6" height="h-4" />
    <div className="flex gap-3 pt-4">
      <SkeletonBase width="w-24" height="h-9" className="rounded-md" />
      <SkeletonBase width="w-24" height="h-9" className="rounded-md" />
    </div>
  </div>
);

// Skeleton for stats/metrics
export const SkeletonStats = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-3"
      >
        <SkeletonBase width="w-16" height="h-16" className="rounded-full" />
        <SkeletonBase width="w-24" height="h-4" />
        <SkeletonBase width="w-32" height="h-8" />
      </div>
    ))}
  </div>
);

// Skeleton for list items
export const SkeletonListItem = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
    <SkeletonBase width="w-12" height="h-12" className="rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBase width="w-3/4" height="h-5" />
      <SkeletonBase width="w-1/2" height="h-4" />
    </div>
    <SkeletonBase width="w-20" height="h-8" className="rounded-full" />
  </div>
);

// Skeleton for list
export const SkeletonList = ({ items = 5 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonListItem key={index} />
    ))}
  </div>
);

// Full page loading skeleton
export const SkeletonPage = () => (
  <div className="p-4 space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex justify-between items-center">
      <SkeletonBase width="w-48" height="h-8" />
      <div className="flex gap-2">
        <SkeletonBase width="w-24" height="h-10" className="rounded-lg" />
        <SkeletonBase width="w-24" height="h-10" className="rounded-lg" />
      </div>
    </div>

    {/* Stats */}
    <SkeletonStats count={3} />

    {/* Main Content */}
    <SkeletonTable rows={8} columns={6} />
  </div>
);

export default SkeletonTable;
