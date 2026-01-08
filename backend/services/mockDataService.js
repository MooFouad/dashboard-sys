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
   * Reset data to original state (reload from files)
   */
  async reset() {
    this.loaded = false;
    await this.loadData();
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
