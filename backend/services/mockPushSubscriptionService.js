/**
 * In-Memory Push Subscription Service for Demo Mode
 * Provides localStorage-like functionality for push subscriptions when MongoDB is not available
 */

class MockPushSubscriptionService {
  constructor() {
    this.subscriptions = [];
  }

  // Find all subscriptions
  async find(filter = {}) {
    console.log('📦 [DEMO] Finding push subscriptions in memory...');
    let results = [...this.subscriptions];

    // Apply filters if provided
    if (filter.userEmail) {
      results = results.filter(sub => sub.userEmail === filter.userEmail);
    }

    console.log(`📦 [DEMO] Found ${results.length} subscription(s)`);
    return results;
  }

  // Find one subscription
  async findOne(filter) {
    console.log('📦 [DEMO] Finding one push subscription in memory...');
    const result = this.subscriptions.find(sub => {
      if (filter.endpoint) return sub.endpoint === filter.endpoint;
      if (filter.userEmail) return sub.userEmail === filter.userEmail;
      if (filter._id) return sub._id === filter._id;
      return false;
    });

    console.log(`📦 [DEMO] Found: ${result ? 'Yes' : 'No'}`);
    return result || null;
  }

  // Create new subscription
  async create(data) {
    console.log('📦 [DEMO] Creating push subscription in memory...');
    console.log('📦 [DEMO] Email:', data.userEmail);
    console.log('📦 [DEMO] Types:', data.notificationTypes);

    const subscription = {
      _id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint: data.endpoint,
      keys: data.keys,
      userEmail: data.userEmail,
      notificationTypes: data.notificationTypes || ['vehicle', 'homeRent', 'electricity', 'absher', 'socialInsurance', 'gosi'],
      userAgent: data.userAgent,
      createdAt: new Date(),
      lastUsed: new Date(),
      save: async function() {
        console.log('📦 [DEMO] Subscription saved (in-memory)');
        return this;
      }
    };

    this.subscriptions.push(subscription);
    console.log(`📦 [DEMO] Total subscriptions: ${this.subscriptions.length}`);
    return subscription;
  }

  // Update many subscriptions
  async updateMany(filter, update) {
    console.log('📦 [DEMO] Updating push subscriptions in memory...');
    let modifiedCount = 0;

    this.subscriptions = this.subscriptions.map(sub => {
      if (filter.userEmail && sub.userEmail === filter.userEmail) {
        modifiedCount++;
        return {
          ...sub,
          ...update.$set
        };
      }
      return sub;
    });

    console.log(`📦 [DEMO] Updated ${modifiedCount} subscription(s)`);
    return { modifiedCount };
  }

  // Delete one subscription
  async deleteOne(filter) {
    console.log('📦 [DEMO] Deleting push subscription from memory...');
    const initialLength = this.subscriptions.length;

    this.subscriptions = this.subscriptions.filter(sub => {
      if (filter.endpoint) return sub.endpoint !== filter.endpoint;
      if (filter._id) return sub._id !== filter._id;
      return true;
    });

    const deletedCount = initialLength - this.subscriptions.length;
    console.log(`📦 [DEMO] Deleted ${deletedCount} subscription(s)`);
    return { deletedCount };
  }

  // Get statistics
  getStats() {
    return {
      total: this.subscriptions.length,
      byType: this.subscriptions.reduce((acc, sub) => {
        (sub.notificationTypes || []).forEach(type => {
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, {})
    };
  }

  // Clear all subscriptions (for testing)
  clear() {
    console.log('📦 [DEMO] Clearing all push subscriptions from memory...');
    this.subscriptions = [];
  }
}

module.exports = new MockPushSubscriptionService();
