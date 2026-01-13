/**
 * Demo Data Loader
 * Pre-populates localStorage with demo data instantly (no backend required)
 */

const STORAGE_PREFIX = 'gts_dashboard_';

// Generate dynamic dates for demo data
const generateDynamicDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Demo data generator
const generateDemoData = () => {
  // Get existing data or generate new
  const existingVehicles = localStorage.getItem(STORAGE_PREFIX + 'vehicles');
  const existingHomeRents = localStorage.getItem(STORAGE_PREFIX + 'homeRents');
  const existingElectricity = localStorage.getItem(STORAGE_PREFIX + 'electricity');

  // Only generate if data doesn't exist
  if (existingVehicles && existingHomeRents && existingElectricity) {
    console.log('✅ Demo data already in localStorage, skipping generation');
    return false;
  }

  console.log('📦 Generating demo data with dynamic expiration dates...');

  // Vehicles demo data (simplified - 2 items with expiring dates)
  const vehicles = [
    {
      _id: 'veh-demo-1',
      plateNumber: 'ABC-1234',
      model: 'Toyota Camry',
      year: 2020,
      licenseExpiryDate: generateDynamicDate(3),
      inspectionExpiryDate: generateDynamicDate(5),
      insuranceExpiryDate: generateDynamicDate(10),
      owner: 'Ahmed Al-Rashid',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'veh-demo-2',
      plateNumber: 'XYZ-5678',
      model: 'Honda Accord',
      year: 2021,
      licenseExpiryDate: generateDynamicDate(9),
      inspectionExpiryDate: generateDynamicDate(11),
      insuranceExpiryDate: generateDynamicDate(7),
      owner: 'Mohammed Al-Fahad',
      createdAt: new Date().toISOString()
    }
  ];

  // Home Rents demo data
  const homeRents = [
    {
      _id: 'rent-demo-1',
      propertyAddress: '123 King Fahd Road, Riyadh',
      tenantName: 'Ahmed Ali',
      monthlyRent: 3000,
      contractStartDate: '2023-01-01',
      contractEndingDate: generateDynamicDate(4),
      createdAt: new Date().toISOString()
    },
    {
      _id: 'rent-demo-2',
      propertyAddress: '456 Olaya Street, Riyadh',
      tenantName: 'Mohammed Hassan',
      monthlyRent: 4500,
      contractStartDate: '2023-06-01',
      contractEndingDate: generateDynamicDate(8),
      createdAt: new Date().toISOString()
    }
  ];

  // Electricity demo data
  const electricity = [
    {
      _id: 'elec-demo-1',
      accountNumber: 'SEC-12345',
      propertyAddress: '123 King Fahd Road, Riyadh',
      billAmount: 450,
      dueDate: generateDynamicDate(2),
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'elec-demo-2',
      accountNumber: 'SEC-67890',
      propertyAddress: '456 Olaya Street, Riyadh',
      billAmount: 620,
      dueDate: generateDynamicDate(6),
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString()
    }
  ];

  // GOSI demo data
  const gosi = [
    {
      _id: 'gosi-demo-1',
      employeeName: 'Ahmed Al-Rashid',
      nin: '1023456789',
      engagementStartDate: '2023-01-15',
      engagementEndDate: generateDynamicDate(5),
      establishment: 'GTS Company',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'gosi-demo-2',
      employeeName: 'Mohammed Al-Fahad',
      nin: '1034567890',
      engagementStartDate: '2023-03-01',
      engagementEndDate: generateDynamicDate(8),
      establishment: 'GTS Company',
      createdAt: new Date().toISOString()
    }
  ];

  // Social Insurance demo data
  const socialInsurance = [
    {
      _id: 'si-demo-1',
      name: 'Khalid Al-Mutairi',
      nin: '1045678901',
      startDate: '2022-09-10',
      endDate: generateDynamicDate(4),
      policyNumber: 'SI-2022-001',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'si-demo-2',
      name: 'Fahad Al-Otaibi',
      nin: '1056789012',
      startDate: '2023-02-15',
      endDate: generateDynamicDate(7),
      policyNumber: 'SI-2023-002',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  // Absher demo data (same as vehicles)
  const absher = vehicles.map(v => ({ ...v, _id: v._id.replace('veh', 'abs') }));

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_PREFIX + 'vehicles', JSON.stringify(vehicles));
    localStorage.setItem(STORAGE_PREFIX + 'homeRents', JSON.stringify(homeRents));
    localStorage.setItem(STORAGE_PREFIX + 'electricity', JSON.stringify(electricity));
    localStorage.setItem(STORAGE_PREFIX + 'gosi', JSON.stringify(gosi));
    localStorage.setItem(STORAGE_PREFIX + 'socialInsurance', JSON.stringify(socialInsurance));
    localStorage.setItem(STORAGE_PREFIX + 'absher', JSON.stringify(absher));

    console.log('✅ Demo data generated and saved to localStorage');
    console.log(`   - Vehicles: ${vehicles.length} items`);
    console.log(`   - Home Rents: ${homeRents.length} items`);
    console.log(`   - Electricity: ${electricity.length} items`);
    console.log(`   - GOSI: ${gosi.length} items`);
    console.log(`   - Social Insurance: ${socialInsurance.length} items`);
    console.log(`   - Absher: ${absher.length} items`);

    return true;
  } catch (error) {
    console.error('❌ Failed to save demo data:', error);
    return false;
  }
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

export default {
  initializeDemoData,
  isDemoMode
};
