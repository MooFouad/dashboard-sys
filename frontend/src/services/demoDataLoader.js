/**
 * Demo Data Loader
 * Pre-populates localStorage with complete mock data (matches backend data)
 */

import mockData from '../data/mockData';

const STORAGE_PREFIX = 'gts_dashboard_';
const DEMO_DATA_VERSION = '4.0'; // Increment to force regeneration

// Demo data generator
const generateDemoData = () => {
  // Check version to force regeneration when data structure changes
  const storedVersion = localStorage.getItem(STORAGE_PREFIX + 'version');

  if (storedVersion !== DEMO_DATA_VERSION) {
    console.log('🔄 Demo data version mismatch, regenerating data...');
    // Clear old data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } else {
    // Get existing data - check all collections
    const existingVehicles = localStorage.getItem(STORAGE_PREFIX + 'vehicles');
    const existingHomeRents = localStorage.getItem(STORAGE_PREFIX + 'homeRents');
    const existingElectricity = localStorage.getItem(STORAGE_PREFIX + 'electricity');
    const existingAbsher = localStorage.getItem(STORAGE_PREFIX + 'absher');
    const existingGosi = localStorage.getItem(STORAGE_PREFIX + 'gosi');
    const existingSocialInsurance = localStorage.getItem(STORAGE_PREFIX + 'socialInsurance');

    // Only skip if ALL collections exist
    if (existingVehicles && existingHomeRents && existingElectricity &&
        existingAbsher && existingGosi && existingSocialInsurance) {
      console.log('✅ Demo data already in localStorage, skipping generation');
      return false;
    }
  }

  console.log('📦 Generating demo data from complete mock data...');

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_PREFIX + 'version', DEMO_DATA_VERSION);
    localStorage.setItem(STORAGE_PREFIX + 'vehicles', JSON.stringify(mockData.vehicles));
    localStorage.setItem(STORAGE_PREFIX + 'homeRents', JSON.stringify(mockData.homeRents));
    localStorage.setItem(STORAGE_PREFIX + 'electricity', JSON.stringify(mockData.electricity));
    localStorage.setItem(STORAGE_PREFIX + 'gosi', JSON.stringify(mockData.gosi));
    localStorage.setItem(STORAGE_PREFIX + 'socialInsurance', JSON.stringify(mockData.socialInsurance));
    localStorage.setItem(STORAGE_PREFIX + 'absher', JSON.stringify(mockData.absher));

    console.log('✅ Demo data generated and saved to localStorage');
    console.log(`   - Vehicles: ${mockData.vehicles.length} items`);
    console.log(`   - Home Rents: ${mockData.homeRents.length} items`);
    console.log(`   - Electricity: ${mockData.electricity.length} items`);
    console.log(`   - GOSI: ${mockData.gosi.length} items`);
    console.log(`   - Social Insurance: ${mockData.socialInsurance.length} items`);
    console.log(`   - Absher: ${mockData.absher.length} items`);

    return true;
  } catch (error) {
    console.error('❌ Failed to save demo data:', error);
    return false;
  }
};

// Calculate status based on remaining days
const calculateStatus = (endDate) => {
  if (!endDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (remainingDays < 0) return 'expired';
  if (remainingDays <= 30) return 'expiring-soon';
  return 'active';
};

// Calculate payment status based on due date
const calculatePaymentStatus = (dueDate) => {
  if (!dueDate) return 'Unpaid';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  // If due date has passed, mark as Overdue
  if (due < today) return 'Overdue';

  // Otherwise, unpaid
  return 'Unpaid';
};

// Check if we should use demo mode
const isDemoMode = () => {
  // Check if DEMO_MODE is set in environment
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Or check if we're on a demo domain
  const isDemoDomain = window.location.hostname.includes('demo') ||
                       window.location.hostname.includes('localhost');

  return demoMode || isDemoDomain;
};

// Initialize demo data
export const initializeDemoData = () => {
  if (isDemoMode()) {
    console.log('🎭 Demo Mode: Initializing instant data loading...');
    return generateDemoData();
  }
  return false;
};

// Export helper functions for dynamic status calculation
export {
  calculateStatus,
  calculatePaymentStatus
};

export default {
  initializeDemoData,
  isDemoMode,
  calculateStatus,
  calculatePaymentStatus
};
