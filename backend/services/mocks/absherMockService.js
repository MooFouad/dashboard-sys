/**
 * TAMM/Absher Mock Service for Portfolio Demo
 * Simulates Absher API responses without making actual API calls
 */

const mockData = require('./mockData');

// Cache for consistent mock vehicle data
const vehicleCache = new Map();

/**
 * Generate consistent mock vehicle data
 */
function generateMockVehicle(plateNumber, sequenceNumber) {
  const cacheKey = `${plateNumber}-${sequenceNumber}`;

  // Check cache first
  if (vehicleCache.has(cacheKey)) {
    return vehicleCache.get(cacheKey);
  }

  // Use plate number as seed for consistency
  const seed = parseInt(plateNumber.replace(/[^0-9]/g, ''));

  const maker = mockData.vehicleMakes[seed % mockData.vehicleMakes.length];
  const models = {
    'Toyota': ['Camry', 'Corolla', 'Land Cruiser', 'Hilux', 'Yaris'],
    'Nissan': ['Altima', 'Maxima', 'Patrol', 'Sunny', 'X-Trail'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent'],
    'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia'],
    'Chevrolet': ['Tahoe', 'Suburban', 'Silverado', 'Malibu'],
    'Ford': ['Explorer', 'F-150', 'Edge', 'Expedition'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
    'Mazda': ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
    'Mitsubishi': ['Lancer', 'Pajero', 'ASX', 'Outlander'],
    'Kia': ['Optima', 'Sportage', 'Sorento', 'Rio'],
    'Lexus': ['ES', 'LS', 'RX', 'LX'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X5'],
    'Jeep': ['Wrangler', 'Grand Cherokee', 'Compass'],
    'Isuzu': ['D-Max', 'MU-X']
  };

  const modelYear = 2015 + (seed % 10); // 2015-2024
  const model = mockData.randomFrom(models[maker] || ['Standard']);

  const driverName = mockData.generateName();
  const ownerName = Math.random() > 0.3 ? driverName : mockData.generateName(); // 70% same as driver

  // Generate expiry dates
  const licenseExpiry = mockData.generateDate(30, 360); // 1 month to 1 year from now
  const insuranceExpiry = mockData.generateDate(15, 365);
  const inspectionExpiry = mockData.generateDate(45, 365);

  const vehicle = {
    plateNumber,
    sequenceNumber,
    plateInfo: {
      plateType: 'Private',
      plateNumber,
      sequenceNumber: sequenceNumber.toString(),
      letterRight: plateNumber[0],
      letterMiddle: plateNumber[1],
      letterLeft: plateNumber[2]
    },
    maker,
    model,
    modelYear,
    color: mockData.randomFrom(['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Gold', 'Beige']),
    chassisNumber: mockData.generateChassisNumber(),
    actualDriverName: driverName,
    actualDriverIdNumber: mockData.generateNIN(),
    ownerName,
    ownerIdNumber: mockData.generateNIN(),
    licenseExpiryDate: licenseExpiry.toISOString().split('T')[0],
    insuranceStatus: Math.random() > 0.1 ? 'Active' : 'Expired', // 90% active
    insuranceCompany: mockData.randomFrom(mockData.insuranceCompanies),
    insuranceExpiryDate: insuranceExpiry.toISOString().split('T')[0],
    insurancePolicyNumber: mockData.generatePolicyNumber(),
    inspectionStatus: Math.random() > 0.15 ? 'Valid' : 'Expired', // 85% valid
    inspectionExpiryDate: inspectionExpiry.toISOString().split('T')[0],
    inspectionCenter: mockData.randomFrom(mockData.inspectionCenters),
    registrationCity: mockData.randomFrom(mockData.cities),
    customsCardNumber: `CC${Math.floor(Math.random() * 900000) + 100000}`,
    lastUpdate: new Date().toISOString()
  };

  vehicleCache.set(cacheKey, vehicle);
  return vehicle;
}

/**
 * Mock TAMM/Absher Service Class
 */
class AbsherMockService {
  constructor() {
    console.log('🎭 Absher Mock Service initialized (Portfolio Demo Mode)');
  }

  /**
   * Simulate successful authentication
   */
  async getAccessToken() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    console.log('✅ [MOCK] TAMM access token generated');
    return 'mock_tamm_access_token_' + Date.now();
  }

  /**
   * Mock vehicle insurance inquiry
   */
  async getVehicleInsurance(plateNumber, sequenceNumber) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    console.log(`🎭 [MOCK] Fetching vehicle insurance for: ${plateNumber}-${sequenceNumber}`);

    const vehicle = generateMockVehicle(plateNumber, sequenceNumber);

    return {
      plateNumber,
      sequenceNumber,
      insuranceStatus: vehicle.insuranceStatus,
      insuranceCompany: vehicle.insuranceCompany,
      policyNumber: vehicle.insurancePolicyNumber,
      expiryDate: vehicle.insuranceExpiryDate,
      coverageType: mockData.randomFrom(['Comprehensive', 'Third Party', 'Third Party Plus']),
      policyStartDate: new Date(new Date(vehicle.insuranceExpiryDate).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      vehicleInfo: {
        maker: vehicle.maker,
        model: vehicle.model,
        modelYear: vehicle.modelYear,
        color: vehicle.color
      }
    };
  }

  /**
   * Mock MVPI (Vehicle Inspection) inquiry
   */
  async getVehicleInspection(plateNumber, sequenceNumber) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 650));

    console.log(`🎭 [MOCK] Fetching vehicle inspection for: ${plateNumber}-${sequenceNumber}`);

    const vehicle = generateMockVehicle(plateNumber, sequenceNumber);

    const inspectionDate = new Date(vehicle.inspectionExpiryDate);
    inspectionDate.setFullYear(inspectionDate.getFullYear() - 1);

    return {
      plateNumber,
      sequenceNumber,
      inspectionStatus: vehicle.inspectionStatus,
      inspectionCenter: vehicle.inspectionCenter,
      inspectionDate: inspectionDate.toISOString().split('T')[0],
      expiryDate: vehicle.inspectionExpiryDate,
      inspectionReportNumber: `INS${Math.floor(Math.random() * 9000000) + 1000000}`,
      result: vehicle.inspectionStatus === 'Valid' ? 'Pass' : 'Expired',
      inspectorName: mockData.generateName(),
      odometerReading: Math.floor(Math.random() * 200000) + 10000,
      testResults: {
        brakes: 'Pass',
        lights: 'Pass',
        tires: 'Pass',
        suspension: 'Pass',
        emissions: Math.random() > 0.1 ? 'Pass' : 'Warning'
      }
    };
  }

  /**
   * Mock Istemarah (Vehicle Registration) renewal inquiry
   */
  async getIstemarahRenewal(plateNumber, sequenceNumber) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));

    console.log(`🎭 [MOCK] Fetching Istemarah renewal status for: ${plateNumber}-${sequenceNumber}`);

    const vehicle = generateMockVehicle(plateNumber, sequenceNumber);

    const canRenew = vehicle.insuranceStatus === 'Active' &&
                     vehicle.inspectionStatus === 'Valid' &&
                     Math.random() > 0.1; // 90% can renew if other conditions met

    return {
      plateNumber,
      sequenceNumber,
      canRenew,
      renewalStatus: canRenew ? 'Eligible' : 'Not Eligible',
      expiryDate: vehicle.licenseExpiryDate,
      blockers: canRenew ? [] : [
        vehicle.insuranceStatus !== 'Active' && 'Insurance Expired',
        vehicle.inspectionStatus !== 'Valid' && 'Inspection Expired',
        Math.random() > 0.8 && 'Outstanding Violations'
      ].filter(Boolean),
      fees: {
        registrationFee: 300,
        plateFee: 100,
        serviceFee: 30,
        total: 430
      },
      vehicleInfo: {
        maker: vehicle.maker,
        model: vehicle.model,
        modelYear: vehicle.modelYear,
        chassisNumber: vehicle.chassisNumber
      }
    };
  }

  /**
   * Mock load profile (vehicle details)
   */
  async loadProfile(userIdNumber, customerId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`🎭 [MOCK] Loading profile for User ID: ${userIdNumber}, Customer ID: ${customerId}`);

    // Generate 3-8 vehicles for this user
    const vehicleCount = 3 + Math.floor(Math.random() * 6);
    const vehicles = [];

    for (let i = 0; i < vehicleCount; i++) {
      const plate = mockData.generatePlateNumber();
      const seq = mockData.generateSequenceNumber();
      vehicles.push(generateMockVehicle(plate, seq));
    }

    return {
      userIdNumber,
      customerId,
      userName: mockData.generateName(),
      vehicles: vehicles.map(v => ({
        plateNumber: v.plateNumber,
        sequenceNumber: v.sequenceNumber,
        maker: v.maker,
        model: v.model,
        modelYear: v.modelYear,
        color: v.color,
        licensExpiryDate: v.licenseExpiryDate,
        insuranceStatus: v.insuranceStatus,
        inspectionStatus: v.inspectionStatus
      })),
      totalVehicles: vehicleCount
    };
  }

  /**
   * Mock get vehicle details by referenceNumber
   */
  async getVehicleByReference(referenceNumber) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 550));

    console.log(`🎭 [MOCK] Fetching vehicle by reference: ${referenceNumber}`);

    // Generate vehicle based on reference number
    const plate = mockData.generatePlateNumber();
    const seq = mockData.generateSequenceNumber();
    const vehicle = generateMockVehicle(plate, seq);

    return {
      ...vehicle,
      referenceNumber,
      found: true
    };
  }

  /**
   * Clear vehicle cache (for testing/demo reset)
   */
  clearCache() {
    vehicleCache.clear();
    console.log('🎭 [MOCK] Absher vehicle cache cleared');
  }
}

module.exports = new AbsherMockService();
