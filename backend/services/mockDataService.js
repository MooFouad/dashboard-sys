const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

/**
 * Mock Data Service
 * Loads and manages demo data from JSON files (no database required)
 * All CRUD operations work in-memory
 */

class MockDataService {
  constructor() {
    this.data = {
      users: [],
      vehicles: [],
      homeRents: [],
      electricity: [],
      socialInsurance: [],
      absher: [],
      gosi: [],
      insurance: [],
      mvpi: []
    };
    this.loaded = false;
  }

  /**
   * Generate dynamic expiration dates for demo
   * Returns dates within the next 2-10 days
   */
  generateDynamicDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Update mock data with dynamic expiration dates
   * Ensures at least 2 items per category expire in the next 10 days
   */
  addDynamicExpirationDates() {
    console.log('🔄 Adding dynamic expiration dates to mock data...');

    // Vehicles: Update first 2 items with expiring dates
    if (this.data.vehicles.length >= 2) {
      this.data.vehicles[0].licenseExpiryDate = this.generateDynamicDate(3);
      this.data.vehicles[0].inspectionExpiryDate = this.generateDynamicDate(5);
      this.data.vehicles[1].insuranceExpiryDate = this.generateDynamicDate(7);
      this.data.vehicles[1].licenseExpiryDate = this.generateDynamicDate(9);
      console.log('   ✅ Vehicles: Set 2 items to expire in 3-9 days');
    }

    // Home Rents: Update first 2 items
    if (this.data.homeRents.length >= 2) {
      this.data.homeRents[0].contractEndingDate = this.generateDynamicDate(4);
      this.data.homeRents[1].contractEndingDate = this.generateDynamicDate(8);
      console.log('   ✅ Home Rents: Set 2 contracts to expire in 4-8 days');
    }

    // Electricity: Update first 2 unpaid bills
    if (this.data.electricity.length >= 2) {
      let unpaidCount = 0;
      for (let i = 0; i < this.data.electricity.length && unpaidCount < 2; i++) {
        if (this.data.electricity[i].paymentStatus !== 'Paid') {
          this.data.electricity[i].dueDate = this.generateDynamicDate(2 + unpaidCount * 4);
          this.data.electricity[i].paymentStatus = 'Unpaid';
          unpaidCount++;
        }
      }
      // If we didn't find 2 unpaid bills, make some unpaid
      if (unpaidCount < 2) {
        this.data.electricity[0].dueDate = this.generateDynamicDate(2);
        this.data.electricity[0].paymentStatus = 'Unpaid';
        this.data.electricity[1].dueDate = this.generateDynamicDate(6);
        this.data.electricity[1].paymentStatus = 'Unpaid';
      }
      console.log('   ✅ Electricity: Set 2 bills due in 2-6 days');
    }

    // Absher: Update first 2 items (same as vehicles - license/inspection/insurance)
    if (this.data.absher.length >= 2) {
      this.data.absher[0].licenseExpiryDate = this.generateDynamicDate(3);
      this.data.absher[0].inspectionExpiryDate = this.generateDynamicDate(5);
      this.data.absher[1].insuranceExpiryDate = this.generateDynamicDate(7);
      this.data.absher[1].licenseExpiryDate = this.generateDynamicDate(9);
      console.log('   ✅ Absher/Tamm: Set 2 items to expire in 3-9 days');
    }

    // Social Insurance: Update first 2 items (uses endDate field)
    if (this.data.socialInsurance.length >= 2) {
      this.data.socialInsurance[0].endDate = this.generateDynamicDate(4);
      this.data.socialInsurance[1].endDate = this.generateDynamicDate(7);
      console.log('   ✅ Social Insurance: Set 2 items to expire in 4-7 days');
    }

    // GOSI: Update first 2 items with engagement end dates
    if (this.data.gosi.length >= 2) {
      this.data.gosi[0].engagementEndDate = this.generateDynamicDate(5);
      this.data.gosi[1].engagementEndDate = this.generateDynamicDate(8);
      console.log('   ✅ GOSI: Set 2 engagements to end in 5-8 days');
    }

    console.log('✅ Dynamic expiration dates applied successfully');
  }

  /**
   * Load all mock data from JSON files
   */
  async loadData() {
    if (this.loaded) return;

    try {
      const mockDataDir = path.join(__dirname, '..', 'data', 'mock');

      // Load each collection
      const collections = [
        'users',
        'vehicles',
        'homeRents',
        'electricity',
        'socialInsurance',
        'absher',
        'gosi'
      ];

      for (const collection of collections) {
        const filePath = path.join(mockDataDir, `${collection}.json`);
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, 'utf8');
          this.data[collection] = JSON.parse(fileData);
        }
      }

      // Hash passwords for users (if not already hashed)
      for (const user of this.data.users) {
        if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }

      // Add dynamic expiration dates for demo mode
      this.addDynamicExpirationDates();

      this.loaded = true;
      console.log('✅ Mock data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading mock data:', error);
      throw error;
    }
  }

  /**
   * Get all items from a collection
   */
  async find(collection, query = {}) {
    await this.loadData();

    let items = [...this.data[collection]];

    // Simple query matching (supports basic filters)
    if (Object.keys(query).length > 0) {
      items = items.filter(item => {
        return Object.keys(query).every(key => {
          if (key === '_id') return item._id === query[key];
          return item[key] === query[key];
        });
      });
    }

    return items;
  }

  /**
   * Find one item by query
   */
  async findOne(collection, query) {
    await this.loadData();

    const items = this.data[collection];
    return items.find(item => {
      return Object.keys(query).every(key => {
        if (key === '_id') return item._id === query[key];
        return item[key] === query[key];
      });
    });
  }

  /**
   * Find one item by ID
   */
  async findById(collection, id) {
    await this.loadData();
    return this.data[collection].find(item => item._id === id);
  }

  /**
   * Create a new item
   */
  async create(collection, data) {
    await this.loadData();

    const newItem = {
      _id: this.generateId(collection),
      ...data,
      createdAt: new Date().toISOString()
    };

    this.data[collection].push(newItem);
    return newItem;
  }

  /**
   * Update an item by ID
   */
  async update(collection, id, updates) {
    await this.loadData();

    const index = this.data[collection].findIndex(item => item._id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.data[collection][index];
  }

  /**
   * Delete an item by ID
   */
  async delete(collection, id) {
    await this.loadData();

    const index = this.data[collection].findIndex(item => item._id === id);
    if (index === -1) return null;

    const deleted = this.data[collection].splice(index, 1)[0];
    return deleted;
  }

  /**
   * Delete multiple items by IDs
   */
  async deleteMany(collection, ids) {
    await this.loadData();

    const deletedItems = [];
    ids.forEach(id => {
      const index = this.data[collection].findIndex(item => item._id === id);
      if (index !== -1) {
        deletedItems.push(this.data[collection].splice(index, 1)[0]);
      }
    });

    return { deletedCount: deletedItems.length, deletedItems };
  }

  /**
   * Count items in a collection
   */
  async count(collection, query = {}) {
    const items = await this.find(collection, query);
    return items.length;
  }

  /**
   * Generate a unique ID for new items
   */
  generateId(collection) {
    const prefix = collection.substring(0, 3);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Reset data to original state (reload from files with new dynamic dates)
   */
  async reset() {
    this.loaded = false;
    await this.loadData();
    console.log('🔄 Mock data reset with fresh dynamic expiration dates');
  }

  /**
   * Get statistics
   */
  async getStats() {
    await this.loadData();

    const stats = {};
    for (const collection in this.data) {
      stats[collection] = this.data[collection].length;
    }
    return stats;
  }
}

// Singleton instance
const mockDataService = new MockDataService();

module.exports = mockDataService;
