import React from 'react';
import { getRowColorClass } from '../../utils/styleUtils';
import { formatDate, calculateRemainingDays } from '../../utils/dateUtils';
import ScrollableTableWrapper from '../common/ScrollableTableWrapper';

const AbsherTable = ({ data, onEdit, onDelete }) => {
  const getEarliestExpiry = (record) => {
    // Only registration expiry is available from Istemarah Renewal API
    const expiryDate = record.registrationExpiryDate || record.renewalExpiryDate;

    if (!expiryDate || expiryDate === 'N/A') return null;

    return new Date(expiryDate);
  };

  // Format plateInfo from "ببأ_7562_1" to "ب ب أ 7562"
  const formatPlateInfo = (plateInfo) => {
    if (!plateInfo || plateInfo === '-') return '-';

    // Split by underscores
    const parts = plateInfo.split('_');

    // We only want the first two parts (letters and number, not the trailing type code)
    const lettersPart = parts[0] || '';
    const numberPart = parts[1] || '';

    // Separate Arabic letters with spaces
    if (lettersPart && /[\u0600-\u06FF]/.test(lettersPart)) {
      const separated = lettersPart.split('').join(' ');
      return `${separated} ${numberPart}`;
    }

    // If no Arabic letters, just join with space
    return `${lettersPart} ${numberPart}`;
  };

  return (
    <ScrollableTableWrapper>
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Sequence Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Plate Info
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Plate Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Owner Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Owner ID Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Maker
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Model Year
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Major Color
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Created Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Renewal Expiry Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Actual Driver ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Actual Driver Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Operator ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Branch Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
              Days Until Expiry
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan="16" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No Absher records found
              </td>
            </tr>
          ) : (
            data.map((record, index) => {
              const earliestExpiry = getEarliestExpiry(record);
              const rowClass = getRowColorClass(record, 'absher');
              const daysUntilExpiry = earliestExpiry ? calculateRemainingDays(earliestExpiry.toISOString().split('T')[0]) : null;

              // Create a unique key combining multiple fields to avoid duplicates
              const uniqueKey = record._id || `${record.plateInfo || record.plateNumber}_${record.sequenceNumber}_${index}`;

              return (
                <tr key={uniqueKey} className={`${rowClass} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.sequenceNumber || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {formatPlateInfo(record.plateInfo || record.plateNumber)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.plateType?.nameEn || record.plateTypeCode || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.ownerName || record.name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.ownerIdNumber || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.maker || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.model || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.modelYear || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.majorColor || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {formatDate(record.createdDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {formatDate(record.renewalExpiryDate || record.registrationExpiryDate || record.expiryDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.actualDriverIdNumber || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.actualDriverName || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.operatorIdNumber || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm dark:text-gray-300">
                    {record.branchName?.en || record.branchName?.ar || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium dark:text-gray-300">
                    {daysUntilExpiry !== null ? (
                      daysUntilExpiry < 0 ? (
                        <span className="text-red-600 dark:text-red-500">Expired</span>
                      ) : (
                        <span className={daysUntilExpiry <= 30 ? 'text-yellow-600 dark:text-yellow-500' : 'text-green-600 dark:text-green-500'}>
                          {daysUntilExpiry} days
                        </span>
                      )
                    ) : '-'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </ScrollableTableWrapper>
  );
};

export default AbsherTable;
