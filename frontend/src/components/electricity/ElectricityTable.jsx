import React from 'react';
import ActionButtons from '../common/ActionButtons';
import { getRowColorClass } from '../../utils/styleUtils';
import ScrollableTableWrapper from '../common/ScrollableTableWrapper';

const ElectricityTable = ({ data, onEdit, onDelete }) => {
  return (
    <ScrollableTableWrapper className="-mx-2 sm:mx-0">
      <table className="min-w-full bg-white dark:bg-gray-900">
      <thead className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">No.</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">City</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Address</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Project</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Division</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Meter Number</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((electricity) => {
          const rowClass = getRowColorClass(electricity, 'electricity');

          return (
            <tr key={electricity._id} className={`border-b dark:border-gray-700 ${rowClass} hover:bg-gray-50 dark:hover:bg-gray-800 transition`}>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{electricity.no}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{electricity.account}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{electricity.name}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{electricity.city}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{electricity.address}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{electricity.project}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{electricity.division}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{electricity.meterNumber}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{electricity.date}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <ActionButtons
                  onEdit={() => onEdit(electricity)}
                  onDelete={() => onDelete(electricity._id)}
                  attachments={electricity.attachments}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </ScrollableTableWrapper>
  );
};

export default ElectricityTable;