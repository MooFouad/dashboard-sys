import { getExpiryStatus } from './dateUtils';

export const getRowColorClass = (item, type) => {
      if (type === 'vehicle') {
            const licenseStatus = getExpiryStatus(item.licenseExpiryDate);
            const inspectionStatus = getExpiryStatus(item.inspectionExpiryDate);

            if (licenseStatus === 'expired' || inspectionStatus === 'expired') {
                  return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400';
            }
            if (licenseStatus === 'warning' || inspectionStatus === 'warning') {
                  return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-orange-500 dark:border-orange-400';
            }
      }

      if (type === 'homeRent') {
            const payments = [
                  item.firstPaymentDate,
                  item.secondPaymentDate,
                  item.thirdPaymentDate,
                  item.fourthPaymentDate
            ];

            if (payments.some(date => getExpiryStatus(date) === 'expired')) {
                  return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400';
            }
            if (payments.some(date => getExpiryStatus(date) === 'warning')) {
                  return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-orange-500 dark:border-orange-400';
            }
      }

      if (type === 'electricity') {
            const dueStatus = getExpiryStatus(item.dueDate);

            if (dueStatus === 'expired' && item.paymentStatus !== 'Paid') {
                  return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400';
            }
            if (dueStatus === 'warning' && item.paymentStatus !== 'Paid') {
                  return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-orange-500 dark:border-orange-400';
            }
      }

      if (type === 'absher') {
            const renewalDate = item.renewalExpiryDate || item.registrationExpiryDate || item.expiryDate;

            if (!renewalDate || renewalDate === '-' || renewalDate === 'N/A') {
                  return 'bg-white dark:bg-gray-900 border-l-4 border-transparent';
            }

            const status = getExpiryStatus(renewalDate);

            if (status === 'expired') {
                  return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400';
            }
            if (status === 'warning') {
                  return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-orange-500 dark:border-orange-400';
            }
      }

      return 'bg-white dark:bg-gray-900 border-l-4 border-transparent';
};