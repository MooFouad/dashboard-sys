/**
 * Local Storage Service
 * Handles all localStorage operations for persisting data in the browser
 * This allows CRUD operations to work without a real database connection
 */

const STORAGE_PREFIX = 'gts_dashboard_';
const STORAGE_VERSION = '1.0';

class LocalStorageService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize localStorage with data from backend
   */
  async initialize(apiService) {
    if (this.initialized) return;

    try {
      // Check if we have data in localStorage
      const hasData = this.hasStoredData();

      if (!hasData) {
        console.log('📦 Initializing localStorage with backend data...');
        // Load initial data from backend and save to localStorage
        await this.syncWithBackend(apiService);
      } else {
        console.log('✅ Using data from localStorage');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing localStorage:', error);
    }
  }

  /**
   * Check if we have any stored data
   */
  hasStoredData() {
    const collections = ['vehicles', 'homeRents', 'electricity', 'socialInsurance', 'gosi', 'absher'];
    return collections.some(collection => {
      const data = this.get(collection);
      return data && data.length > 0;
    });
  }

  /**
   * Sync data from backend to localStorage
   */
  async syncWithBackend(apiService) {
    const collections = [
      { name: 'vehicles', endpoint: '/vehicles' },
      { name: 'homeRents', endpoint: '/home-rents' },
      { name: 'electricity', endpoint: '/electricity' },
      { name: 'socialInsurance', endpoint: '/social-insurance' },
      { name: 'gosi', endpoint: '/gosi' },
      { name: 'absher', endpoint: '/absher' }
    ];

    for (const collection of collections) {
      try {
        // Use apiService.request directly to bypass localStorage and get backend data
        const response = await apiService.request(collection.endpoint + '?limit=1000', {
          method: 'GET'
        });

        if (response.success && response.data) {
          this.set(collection.name, response.data);
          console.log(`  ✓ ${collection.name}: ${response.data.length} items`);
        }
      } catch (error) {
        console.warn(`  ✗ Failed to load ${collection.name}:`, error.message);
      }
    }
  }

  /**
   * Get data from localStorage
   */
  get(key) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set data in localStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all GTS Dashboard data from localStorage
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      this.initialized = false;
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all items from a collection
   */
  findAll(collection) {
    return this.get(collection) || [];
  }

  /**
   * Find item by ID
   */
  findById(collection, id) {
    const items = this.findAll(collection);
    return items.find(item => item._id === id);
  }

  /**
   * Create new item
   */
  create(collection, data) {
    const items = this.findAll(collection);

    // Generate ID if not provided
    if (!data._id) {
      data._id = this.generateId(collection);
    }

    // Add timestamps
    data.createdAt = new Date().toISOString();

    items.push(data);
    this.set(collection, items);

    return data;
  }

  /**
   * Update item by ID
   */
  update(collection, id, updates) {
    const items = this.findAll(collection);
    const index = items.findIndex(item => item._id === id);

    if (index === -1) {
      return null;
    }

    items[index] = {
      ...items[index],
      ...updates,
      _id: id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    this.set(collection, items);
    return items[index];
  }

  /**
   * Delete item by ID
   */
  delete(collection, id) {
    const items = this.findAll(collection);
    const index = items.findIndex(item => item._id === id);

    if (index === -1) {
      return false;
    }

    items.splice(index, 1);
    this.set(collection, items);

    return true;
  }

  /**
   * Generate unique ID
   */
  generateId(collection) {
    const prefix = collection.substring(0, 3);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get storage stats
   */
  getStats() {
    const collections = ['vehicles', 'homeRents', 'electricity', 'socialInsurance', 'gosi', 'absher'];
    const stats = {};

    collections.forEach(collection => {
      const items = this.findAll(collection);
      stats[collection] = items.length;
    });

    return stats;
  }

  /**
   * Export all data (for backup)
   */
  exportData() {
    const collections = ['vehicles', 'homeRents', 'electricity', 'socialInsurance', 'gosi', 'absher'];
    const data = {};

    collections.forEach(collection => {
      data[collection] = this.findAll(collection);
    });

    return {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      data
    };
  }

  /**
   * Import data (restore from backup)
   */
  importData(backup) {
    if (!backup || !backup.data) {
      throw new Error('Invalid backup data');
    }

    Object.keys(backup.data).forEach(collection => {
      this.set(collection, backup.data[collection]);
    });

    return true;
  }
}

// Create singleton instance
const localStorageService = new LocalStorageService();

export default localStorageService;
