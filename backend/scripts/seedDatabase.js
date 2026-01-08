const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Models
const Vehicle = require('../models/Vehicle');
const HomeRent = require('../models/HomeRent');
const Electricity = require('../models/Electricity');
const SocialInsurance = require('../models/SocialInsurance');
const GOSI = require('../models/GOSI');
const Absher = require('../models/Absher');
const Insurance = require('../models/Insurance');
const MVPI = require('../models/MVPI');
const User = require('../models/User');

// Mock data generators
const mockData = require('../services/mocks/mockData');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4
  });
  console.log('✅ Connected to MongoDB');
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ===================================
// SEED USERS (Demo Accounts)
// ===================================
async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Users already have ${count} records. Skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('Demo@2024', 10);

  const users = [
    {
      email: 'demo@gts-demo.com',
      password: hashedPassword,
      name: 'Demo Admin',
      role: 'admin',
      isActive: true
    },
    {
      email: 'user@gts-demo.com',
      password: await bcrypt.hash('User@2024', 10),
      name: 'Demo User',
      role: 'user',
      isActive: true
    },
    {
      email: 'viewer@gts-demo.com',
      password: await bcrypt.hash('Viewer@2024', 10),
      name: 'Demo Viewer',
      role: 'viewer',
      isActive: true
    }
  ];

  await User.insertMany(users);
  console.log(`✅ Seeded Users: ${users.length}`);
}

// ===================================
// SEED VEHICLES (15-20 vehicles)
// ===================================
async function seedVehicles() {
  const count = await Vehicle.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Vehicles already have ${count} records. Skipping.`);
    return;
  }

  const year = new Date().getFullYear();
  const vehicles = [];
  const vehicleData = []; // Store for other collections

  const vehicleModels = {
    'Toyota': ['Camry', 'Corolla', 'Land Cruiser', 'Hilux', 'Yaris'],
    'Nissan': ['Altima', 'Patrol', 'Sunny', 'X-Trail'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
    'GMC': ['Sierra', 'Yukon', 'Terrain'],
    'Ford': ['Explorer', 'F-150', 'Edge'],
    'Honda': ['Accord', 'Civic', 'CR-V']
  };

  for (let i = 0; i < 18; i++) {
    const plateNumber = mockData.generatePlateNumber();
    const sequenceNumber = mockData.generateSequenceNumber().toString();
    const maker = mockData.randomFrom(mockData.vehicleMakes);
    const model = mockData.randomFrom(vehicleModels[maker] || ['Standard']);
    const driverName = mockData.generateName();

    // Varying expiry dates for demo purposes
    const licenseExpiry = mockData.generateDate(i * 10 - 30, 60);  // Some expired, some active
    const inspectionExpiry = mockData.generateDate(i * 8 - 20, 50);

    const vehicle = {
      plateNumber,
      plateType: 'Private',
      vehicleMaker: maker,
      vehicleModel: model,
      modelYear: year - Math.floor(Math.random() * 8),
      sequenceNumber,
      chassisNumber: mockData.generateChassisNumber(),
      licenseExpiryDate: formatDate(licenseExpiry),
      inspectionExpiryDate: formatDate(inspectionExpiry),
      actualDriverId: `DRV${String(i + 1).padStart(3, '0')}`,
      actualDriverName: driverName,
      mvpiStatus: Math.random() > 0.2 ? 'Active' : 'Expired',
      insuranceStatus: Math.random() > 0.15 ? 'Valid' : 'Expired',
      restrictionStatus: 'None',
      vehicleStatus: 'Active',
      bodyType: mockData.randomFrom(['Sedan', 'SUV', 'Truck', 'Hatchback']),
      color: mockData.randomFrom(['White', 'Black', 'Silver', 'Gray', 'Blue']),
      attachments: []
    };

    vehicles.push(vehicle);
    vehicleData.push({ ...vehicle, driverName }); // Store for cross-referencing
  }

  await Vehicle.insertMany(vehicles);
  console.log(`✅ Seeded Vehicles: ${vehicles.length}`);
  return vehicleData;
}

// ===================================
// SEED HOME RENTS (8-10 properties)
// ===================================
async function seedHomeRents() {
  const count = await HomeRent.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  HomeRents already have ${count} records. Skipping.`);
    return;
  }

  const propertyTypes = [
    { type: 'Office', avgRent: 8000 },
    { type: 'Warehouse', avgRent: 15000 },
    { type: 'Residential', avgRent: 5000 },
    { type: 'Showroom', avgRent: 12000 }
  ];

  const homeRents = [];

  for (let i = 0; i < 10; i++) {
    const propType = mockData.randomFrom(propertyTypes);
    const monthlyRent = propType.avgRent + Math.floor(Math.random() * 5000) - 2500;
    const startDate = mockData.generateDate(-365 * 2, 365); // Started 1-3 years ago
    const endDate = mockData.generateDate(i * 15 - 30, 60); // Some expiring soon

    homeRents.push({
      contractNumber: `CNT-2024-${String(i + 1).padStart(4, '0')}`,
      contractStartingDate: formatDate(startDate),
      contractEndingDate: formatDate(endDate),
      notice: mockData.randomFrom(['30 days', '60 days', '90 days']),
      paymentTerms: mockData.randomFrom(['Monthly', 'Quarterly', 'Annually']),
      paymentType: mockData.randomFrom(['bank transfer', 'cash', 'check']),
      paymentStatus: mockData.randomFrom(['Paid', 'Pending', 'Overdue']),
      amount: monthlyRent,
      rentAnnually: monthlyRent * 12,
      address: `${Math.floor(Math.random() * 999) + 1} ${mockData.randomFrom(['King Fahd Rd', 'Olaya St', 'Tahlia St', 'Makkah Rd', 'Prince Sultan St'])}, ${mockData.randomFrom(mockData.cities)}`,
      contactPerson: mockData.generateName(),
      gtsContact: mockData.generateName(),
      comments: mockData.randomFrom(['Near metro', 'Top floor', 'Ground floor', 'Parking included', 'Recently renovated', '']),
      attachments: []
    });
  }

  await HomeRent.insertMany(homeRents);
  console.log(`✅ Seeded HomeRents: ${homeRents.length}`);
}

// ===================================
// SEED ELECTRICITY (5-8 accounts)
// ===================================
async function seedElectricity() {
  const count = await Electricity.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Electricity already has ${count} records. Skipping.`);
    return;
  }

  const facilities = [
    { type: 'Office', prop: 'Commercial' },
    { type: 'Warehouse', prop: 'Industrial' },
    { type: 'Workshop', prop: 'Industrial' },
    { type: 'Showroom', prop: 'Commercial' },
    { type: 'Storage Facility', prop: 'Industrial' }
  ];

  const electricity = [];

  for (let i = 0; i < 7; i++) {
    const facility = mockData.randomFrom(facilities);
    const previousReading = mockData.generateMeterReading(facility.type.toLowerCase());
    const consumption = Math.floor(Math.random() * 5000) + 1000;
    const currentReading = previousReading + consumption;
    const billAmount = consumption * (5.5 + Math.random() * 2); // 5.5-7.5 SAR per unit

    electricity.push({
      departmentNumber: `DEPT-${String(i + 1).padStart(2, '0')}`,
      meterNumber: `MTR-${String(i + 1).padStart(6, '0')}`,
      location: `${facility.type} - ${mockData.randomFrom(mockData.cities)}`,
      lastReadingDate: addDays(new Date(), -30 - Math.floor(Math.random() * 10)),
      currentReading,
      previousReading,
      consumption,
      billAmount: Math.round(billAmount * 100) / 100,
      billDate: addDays(new Date(), -20),
      dueDate: addDays(new Date(), 5 + Math.floor(Math.random() * 20)),
      paymentStatus: mockData.randomFrom(['Paid', 'Pending', 'Pending']), // More pending for demo
      propertyType: facility.prop,
      subscriberName: `${mockData.randomFrom(mockData.companyNames)} - ${facility.type}`,
      subscriberNumber: `SUB-${String(i + 1).padStart(6, '0')}`,
      notes: '',
      attachments: []
    });
  }

  await Electricity.insertMany(electricity);
  console.log(`✅ Seeded Electricity: ${electricity.length}`);
}

// ===================================
// SEED SOCIAL INSURANCE (12-18 employees)
// ===================================
async function seedSocialInsurance() {
  const count = await SocialInsurance.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  SocialInsurance already has ${count} records. Skipping.`);
    return;
  }

  const departments = ['Operations', 'Finance', 'Admin', 'Maintenance', 'HR', 'IT'];
  const socialInsuranceRecords = [];
  const employeeData = []; // Store for GOSI matching

  for (let i = 0; i < 16; i++) {
    const nin = mockData.generateNIN();
    const name = mockData.generateName();
    const startDate = mockData.generateDate(-365 * (1 + Math.floor(Math.random() * 4)), 60); // 1-5 years ago
    const endDate = mockData.generateDate(i * 12 - 20, 80); // Some expiring soon

    const record = {
      name,
      nin,
      division: mockData.randomFrom(departments),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    socialInsuranceRecords.push(record);
    employeeData.push({ nin, name, startDate: formatDate(startDate), endDate: formatDate(endDate) });
  }

  await SocialInsurance.insertMany(socialInsuranceRecords);
  console.log(`✅ Seeded SocialInsurance: ${socialInsuranceRecords.length}`);
  return employeeData;
}

// ===================================
// SEED GOSI (matching Social Insurance)
// ===================================
async function seedGOSI(employeeData) {
  const count = await GOSI.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  GOSI already has ${count} records. Skipping.`);
    return;
  }

  const gosiRecords = employeeData.map(emp => ({
    nin: emp.nin,
    name: emp.name,
    nameAr: emp.name.split(' ').reverse().join(' '), // Simplified Arabic name
    establishmentName: mockData.randomFrom(mockData.companyNames),
    wage: mockData.generateWage(),
    engagementStartDate: emp.startDate,
    engagementEndDate: emp.endDate || null,
    contributionAmount: null, // Will be calculated from wage
    status: emp.endDate && new Date(emp.endDate) < new Date() ? 'Inactive' : 'Active',
    lastSync: new Date()
  }));

  // Calculate contribution amounts (9.5% of wage)
  gosiRecords.forEach(record => {
    record.contributionAmount = Math.floor(record.wage * 0.095);
  });

  await GOSI.insertMany(gosiRecords);
  console.log(`✅ Seeded GOSI: ${gosiRecords.length}`);
}

// ===================================
// SEED ABSHER (matching Vehicles)
// ===================================
async function seedAbsher(vehicleData) {
  const count = await Absher.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Absher already has ${count} records. Skipping.`);
    return;
  }

  const absherRecords = vehicleData.map(vehicle => ({
    plateNumber: vehicle.plateNumber,
    sequenceNumber: vehicle.sequenceNumber,
    plateType: 'Private',
    letterRight: vehicle.plateNumber[0],
    letterMiddle: vehicle.plateNumber[1],
    letterLeft: vehicle.plateNumber[2],
    maker: vehicle.vehicleMaker,
    model: vehicle.vehicleModel,
    modelYear: vehicle.modelYear,
    color: vehicle.color,
    actualDriverName: vehicle.actualDriverName,
    actualDriverIdNumber: mockData.generateNIN(),
    ownerName: Math.random() > 0.3 ? vehicle.actualDriverName : mockData.generateName(),
    ownerIdNumber: mockData.generateNIN(),
    registrationCity: mockData.randomFrom(mockData.cities),
    customsCardNumber: `CC${Math.floor(Math.random() * 900000) + 100000}`,
    referenceNumber: `REF-${Math.floor(Math.random() * 9000000) + 1000000}`,
    source: 'manual',
    lastSync: new Date()
  }));

  await Absher.insertMany(absherRecords);
  console.log(`✅ Seeded Absher: ${absherRecords.length}`);
}

// ===================================
// SEED INSURANCE (matching Vehicles)
// ===================================
async function seedInsurance(vehicleData) {
  const count = await Insurance.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Insurance already has ${count} records. Skipping.`);
    return;
  }

  const insuranceRecords = vehicleData.map((vehicle, i) => {
    const policyStart = mockData.generateDate(-180, 60); // Started 3-9 months ago
    const policyEnd = new Date(policyStart);
    policyEnd.setFullYear(policyEnd.getFullYear() + 1); // 1 year policy

    return {
      plateNumber: vehicle.plateNumber,
      policyHolderName: vehicle.actualDriverName,
      policyHolderIdNumber: mockData.generateNIN(),
      mainPolicyNumber: mockData.generatePolicyNumber(),
      insuranceCompanyName: mockData.randomFrom(mockData.insuranceCompanies),
      coverageType: mockData.randomFrom(['Comprehensive', 'Third Party', 'Third Party Plus']),
      coverageAmount: Math.floor(Math.random() * 40000) + 10000,
      policyStartDate: formatDate(policyStart),
      policyEndDate: formatDate(policyEnd),
      status: vehicle.insuranceStatus
    };
  });

  await Insurance.insertMany(insuranceRecords);
  console.log(`✅ Seeded Insurance: ${insuranceRecords.length}`);
}

// ===================================
// SEED MVPI (matching Vehicles)
// ===================================
async function seedMVPI(vehicleData) {
  const count = await MVPI.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  MVPI already has ${count} records. Skipping.`);
    return;
  }

  const mvpiRecords = vehicleData.map(vehicle => {
    const inspectionDate = new Date(vehicle.inspectionExpiryDate);
    inspectionDate.setFullYear(inspectionDate.getFullYear() - 1); // Inspection done 1 year before expiry

    return {
      plateNumber: vehicle.plateNumber,
      sequenceNumber: vehicle.sequenceNumber,
      inspectionReportNumber: `INS-${Math.floor(Math.random() * 9000000) + 1000000}`,
      inspectionCenterName: mockData.randomFrom(mockData.inspectionCenters),
      inspectionDate: formatDate(inspectionDate),
      inspectionExpiryDate: vehicle.inspectionExpiryDate,
      inspectorName: mockData.generateName(),
      odometerReading: Math.floor(Math.random() * 200000) + 10000,
      result: vehicle.mvpiStatus === 'Active' ? 'Pass' : 'Expired',
      notes: '',
      lastSync: new Date()
    };
  });

  await MVPI.insertMany(mvpiRecords);
  console.log(`✅ Seeded MVPI: ${mvpiRecords.length}`);
}

// ===================================
// MAIN SEED FUNCTION
// ===================================
async function run() {
  try {
    await connect();

    console.log('\n🌱 Starting comprehensive demo data seeding...\n');

    // Seed in order to maintain relationships
    await seedUsers();
    const vehicleData = await seedVehicles();
    await seedHomeRents();
    await seedElectricity();
    const employeeData = await seedSocialInsurance();

    // Seed related collections with cross-references
    if (employeeData) await seedGOSI(employeeData);
    if (vehicleData) {
      await seedAbsher(vehicleData);
      await seedInsurance(vehicleData);
      await seedMVPI(vehicleData);
    }

    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('📊 Demo Data Summary:');
    console.log('   - Users: 3 (demo@gts-demo.com, user@gts-demo.com, viewer@gts-demo.com)');
    console.log('   - Vehicles: 18');
    console.log('   - Home Rents: 10');
    console.log('   - Electricity: 7');
    console.log('   - Social Insurance: 16');
    console.log('   - GOSI: 16');
    console.log('   - Absher: 18');
    console.log('   - Insurance: 18');
    console.log('   - MVPI: 18');
    console.log('\n✅ All demo data has been seeded with realistic relationships!');
    console.log('\n🔐 Demo Account Credentials:');
    console.log('   Email: demo@gts-demo.com');
    console.log('   Password: Demo@2024\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

run();
