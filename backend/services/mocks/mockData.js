/**
 * Mock Data Generator for Portfolio Demo
 * Generates realistic but fictional data for Saudi Arabian context
 */

// Saudi-themed realistic names (diverse international workforce)
const firstNames = [
  'Ahmed', 'Mohammed', 'Abdullah', 'Khalid', 'Omar', 'Faisal', 'Saud', 'Mansour',
  'Sarah', 'Fatima', 'Noura', 'Hind', 'Lama', 'Reem', 'Amira', 'Maha',
  'Raj', 'Priya', 'Muhammad', 'Ali', 'Hassan', 'Ibrahim', 'Youssef', 'Karim',
  'Maria', 'John', 'David', 'Michael', 'Robert', 'James', 'William', 'Richard'
];

const lastNames = [
  'Al-Ghamdi', 'Al-Zahrani', 'Al-Otaibi', 'Al-Harbi', 'Al-Mutairi', 'Al-Qahtani',
  'Al-Dosari', 'Al-Shammari', 'Al-Malki', 'Al-Rashid', 'Al-Shehri', 'Al-Amri',
  'Khan', 'Patel', 'Ahmed', 'Ali', 'Hassan', 'Ibrahim', 'Youssef', 'Mahmoud',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Rodriguez', 'Davis'
];

// Saudi company names
const companyNames = [
  'Green Tech Solutions', 'Saudi Facilities Co.', 'Riyadh Transportation Services',
  'Eastern Province Logistics', 'Gulf Transport Group', 'Arabian Fleet Management',
  'Middle East Services Inc.', 'Kingdom Operations Ltd.', 'Desert Logistics Co.'
];

// Saudi cities
const cities = [
  'Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Jubail', 'Tabuk',
  'Buraidah', 'Abha', 'Najran', 'Al-Ahsa', 'Yanbu', 'Al-Kharj', 'Taif'
];

// Vehicle makes common in Saudi Arabia
const vehicleMakes = [
  'Toyota', 'Nissan', 'Hyundai', 'GMC', 'Chevrolet', 'Ford', 'Honda', 'Mazda',
  'Mitsubishi', 'Kia', 'Lexus', 'Mercedes-Benz', 'BMW', 'Jeep', 'Isuzu'
];

// Insurance companies
const insuranceCompanies = [
  'Tawuniya', 'Malath Insurance', 'AXA Saudi', 'Walaa Cooperative Insurance',
  'Medgulf Insurance', 'Al Rajhi Takaful', 'SABB Takaful', 'Solidarity Saudi Takaful',
  'Salama Insurance', 'Gulf Union Insurance'
];

// Inspection centers
const inspectionCenters = [
  'Fahes Riyadh Center', 'Saudi Vehicle Inspection - Jeddah', 'SAEI Dammam',
  'Eastern Province Inspection', 'Riyadh North Fahes Center', 'Jeddah South Testing',
  'Al-Khobar Vehicle Center', 'Taif Inspection Services', 'Mecca Testing Facility'
];

/**
 * Generate random Saudi National ID Number (10 digits)
 * Format: 1XXXXXXXXX or 2XXXXXXXXX
 */
function generateNIN() {
  const prefix = Math.random() > 0.5 ? '1' : '2'; // 1 for Saudi, 2 for resident
  const remaining = Math.floor(Math.random() * 900000000) + 100000000;
  return prefix + remaining.toString();
}

/**
 * Generate random Saudi plate number
 * Format: ABC-1234 (3 letters, 4 digits)
 */
function generatePlateNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const plateLetters = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');
  const plateNumbers = Math.floor(Math.random() * 9000) + 1000;
  return `${plateLetters}-${plateNumbers}`;
}

/**
 * Generate sequence number for vehicle (1-4 digits)
 */
function generateSequenceNumber() {
  return Math.floor(Math.random() * 9000) + 1000;
}

/**
 * Generate chassis number
 */
function generateChassisNumber() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // Excluding I, O, Q
  return Array.from({ length: 17 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Generate random person name
 */
function generateName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generate random date within range
 */
function generateDate(daysOffset = 0, variance = 365) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + daysOffset);
  const randomDays = Math.floor(Math.random() * variance) - variance / 2;
  baseDate.setDate(baseDate.getDate() + randomDays);
  return baseDate;
}

/**
 * Generate realistic wage for Saudi market (SAR)
 */
function generateWage() {
  const wageRanges = [
    { min: 3000, max: 5000, weight: 3 },  // Entry level
    { min: 5000, max: 8000, weight: 4 },  // Mid level
    { min: 8000, max: 12000, weight: 2 }, // Senior
    { min: 12000, max: 20000, weight: 1 } // Management
  ];

  // Weighted random selection
  const totalWeight = wageRanges.reduce((sum, range) => sum + range.weight, 0);
  let random = Math.random() * totalWeight;

  for (const range of wageRanges) {
    random -= range.weight;
    if (random <= 0) {
      return Math.floor(Math.random() * (range.max - range.min) + range.min);
    }
  }

  return 5000; // Fallback
}

/**
 * Generate policy number
 */
function generatePolicyNumber(year = new Date().getFullYear()) {
  const prefix = 'POL';
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${year}-${randomNum}`;
}

/**
 * Random selection from array
 */
function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate realistic meter reading based on facility type
 */
function generateMeterReading(facilityType = 'office') {
  const ranges = {
    office: { min: 5000, max: 25000 },
    warehouse: { min: 15000, max: 50000 },
    residential: { min: 3000, max: 15000 },
    industrial: { min: 30000, max: 100000 }
  };

  const range = ranges[facilityType] || ranges.office;
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}

module.exports = {
  firstNames,
  lastNames,
  companyNames,
  cities,
  vehicleMakes,
  insuranceCompanies,
  inspectionCenters,
  generateNIN,
  generatePlateNumber,
  generateSequenceNumber,
  generateChassisNumber,
  generateName,
  generateDate,
  generateWage,
  generatePolicyNumber,
  randomFrom,
  generateMeterReading
};
