/**
 * GOSI Mock Service for Portfolio Demo
 * Simulates GOSI API responses without making actual API calls
 */

const mockData = require('./mockData');

// Cache for consistent mock employee data based on NIN
const employeeCache = new Map();

/**
 * Generate consistent mock employee data for a given NIN
 */
function generateMockEmployee(nin) {
  // Check cache first for consistency
  if (employeeCache.has(nin)) {
    return employeeCache.get(nin);
  }

  // Use NIN as seed for consistent random data
  const seed = parseInt(nin.substring(1, 5));
  const nameIndex = seed % mockData.firstNames.length;
  const lastNameIndex = seed % mockData.lastNames.length;

  const name = `${mockData.firstNames[nameIndex]} ${mockData.lastNames[lastNameIndex]}`;
  const nameAr = `${mockData.lastNames[lastNameIndex]} ${mockData.firstNames[nameIndex]}`; // Simplified Arabic

  // Generate dates relative to seed
  const yearsAgo = 1 + (seed % 5); // 1-5 years ago
  const engagementStartDate = new Date();
  engagementStartDate.setFullYear(engagementStartDate.getFullYear() - yearsAgo);

  // Some employees have end dates (left company)
  const hasEndDate = seed % 5 === 0; // 20% have end dates
  const engagementEndDate = hasEndDate
    ? new Date(engagementStartDate.getTime() + (Math.random() * 365 * 2 * 24 * 60 * 60 * 1000))
    : null;

  const wage = mockData.generateWage();
  const contributionAmount = Math.floor(wage * 0.095); // 9.5% GOSI contribution rate

  const employee = {
    nin,
    name,
    nameAr,
    establishmentName: mockData.randomFrom(mockData.companyNames),
    wage,
    contributionAmount,
    engagementStartDate: engagementStartDate.toISOString().split('T')[0],
    engagementEndDate: engagementEndDate ? engagementEndDate.toISOString().split('T')[0] : null,
    status: hasEndDate ? 'Inactive' : 'Active',
    coverage: {
      occupationalHazards: true,
      unemployment: seed % 3 !== 0, // 66% have unemployment coverage
      annuities: true
    },
    lastUpdate: new Date().toISOString()
  };

  // Cache for future requests
  employeeCache.set(nin, employee);

  return employee;
}

/**
 * Mock GOSI Service Class
 */
class GOSIMockService {
  constructor() {
    console.log('🎭 GOSI Mock Service initialized (Portfolio Demo Mode)');
  }

  /**
   * Simulate successful authentication
   */
  async getAccessToken() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('✅ [MOCK] GOSI access token generated');
    return 'mock_gosi_access_token_' + Date.now();
  }

  /**
   * Mock fetch employee data by NIN
   */
  async fetchEmployeeData(nin) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`🎭 [MOCK] Fetching GOSI data for NIN: ${nin}`);

    // Validate NIN format
    if (!nin || nin.length !== 10) {
      throw new Error('Invalid NIN format. Must be 10 digits.');
    }

    const employee = generateMockEmployee(nin);

    console.log(`✅ [MOCK] GOSI data retrieved for: ${employee.name}`);
    return employee;
  }

  /**
   * Mock fetch employee engagement history
   */
  async fetchEngagementHistory(nin) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    console.log(`🎭 [MOCK] Fetching engagement history for NIN: ${nin}`);

    const employee = generateMockEmployee(nin);

    // Generate 1-3 historical engagements
    const historyCount = 1 + Math.floor(Math.random() * 3);
    const history = [];

    for (let i = 0; i < historyCount; i++) {
      const yearsAgo = 1 + i * 2;
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - yearsAgo - 1);

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() - yearsAgo);

      history.push({
        establishmentName: mockData.randomFrom(mockData.companyNames),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        wage: mockData.generateWage(),
        reason: i === historyCount - 1 ? null : mockData.randomFrom(['Resignation', 'Transfer', 'Contract End'])
      });
    }

    // Add current engagement
    history.unshift({
      establishmentName: employee.establishmentName,
      startDate: employee.engagementStartDate,
      endDate: employee.engagementEndDate,
      wage: employee.wage,
      reason: null
    });

    return history;
  }

  /**
   * Mock fetch contribution details
   */
  async fetchContributionDetails(nin, year = new Date().getFullYear()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`🎭 [MOCK] Fetching contribution details for NIN: ${nin}, Year: ${year}`);

    const employee = generateMockEmployee(nin);
    const monthlyContribution = employee.contributionAmount;

    // Generate 12 months of contributions
    const contributions = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      year,
      wage: employee.wage,
      contributionAmount: monthlyContribution,
      employeeShare: Math.floor(monthlyContribution * 0.5),
      employerShare: Math.floor(monthlyContribution * 0.5),
      paid: Math.random() > 0.1, // 90% paid
      paymentDate: Math.random() > 0.1
        ? new Date(year, month, Math.floor(Math.random() * 10) + 1).toISOString().split('T')[0]
        : null
    }));

    return {
      nin,
      year,
      totalContributions: monthlyContribution * 12,
      paidMonths: contributions.filter(c => c.paid).length,
      contributions
    };
  }

  /**
   * Mock bulk fetch for multiple employees
   */
  async fetchMultipleEmployees(nins) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`🎭 [MOCK] Fetching GOSI data for ${nins.length} employees`);

    const results = nins.map(nin => {
      try {
        return {
          nin,
          success: true,
          data: generateMockEmployee(nin)
        };
      } catch (error) {
        return {
          nin,
          success: false,
          error: error.message
        };
      }
    });

    return results;
  }

  /**
   * Clear employee cache (for testing/demo reset)
   */
  clearCache() {
    employeeCache.clear();
    console.log('🎭 [MOCK] GOSI employee cache cleared');
  }
}

module.exports = new GOSIMockService();
