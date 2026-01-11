import localStorageService from './localStorageService';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const USE_LOCAL_STORAGE = true; // Enable localStorage-first approach

// Collection name mapping (endpoint -> localStorage collection)
const COLLECTION_MAP = {
  '/vehicles': 'vehicles',
  '/home-rents': 'homeRents',
  '/electricity': 'electricity',
  '/social-insurance': 'socialInsurance',
  '/gosi': 'gosi',
  '/absher': 'absher'
};

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to extract collection name from endpoint
const getCollectionName = (endpoint) => {
  const baseEndpoint = endpoint.split('?')[0].split('/').slice(0, 2).join('/');
  return COLLECTION_MAP[baseEndpoint];
};

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds for Render cold starts

      // Add auth token to headers
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          // Trigger a custom event that AuthContext can listen to
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error(`API Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

      if (error.name === 'AbortError') {
        console.error('Request timed out after 60 seconds');
      }

      // Don't retry on 401 errors
      if (error.message.includes('Session expired')) {
        throw error;
      }

      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.request(endpoint, options, retryCount + 1);
      }

      throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }

  async get(endpoint, params = {}) {
    const collection = getCollectionName(endpoint);

    // Use localStorage if enabled and collection is mapped
    if (USE_LOCAL_STORAGE && collection) {
      try {
        // Initialize localStorage if not done (only if we have auth token)
        if (!localStorageService.initialized && getAuthToken()) {
          await localStorageService.initialize(this);
        }

        const items = localStorageService.findAll(collection);

        // If we have data in localStorage, use it
        if (items && items.length > 0) {
          console.log(`✅ Loading from localStorage: ${collection} (${items.length} items)`);

          // Return in the same format as backend
          return {
            success: true,
            data: items,
            pagination: {
              total: items.length,
              page: 1,
              limit: items.length,
              pages: 1
            }
          };
        }

        // If no data in localStorage, fall through to API
        console.log(`⚠️ No localStorage data for ${collection}, fetching from API...`);
      } catch (error) {
        console.warn('LocalStorage get failed, falling back to API:', error);
      }
    }

    // Fallback to API
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const response = await this.request(url, { method: 'GET' });

    // Save to localStorage for next time (if we have a collection and auth)
    if (USE_LOCAL_STORAGE && collection && getAuthToken() && response.success && response.data) {
      try {
        localStorageService.set(collection, response.data);
        console.log(`💾 Saved to localStorage: ${collection} (${response.data.length} items)`);
      } catch (error) {
        console.warn(`Failed to save ${collection} to localStorage:`, error);
      }
    }

    return response;
  }

  async post(endpoint, data) {
    const collection = getCollectionName(endpoint);

    // Save to localStorage first
    if (USE_LOCAL_STORAGE && collection) {
      try {
        const newItem = localStorageService.create(collection, data);
        console.log(`✅ Saved to localStorage: ${collection}`);

        // Return in the same format as backend
        return {
          success: true,
          message: `${collection} created successfully`,
          data: newItem
        };
      } catch (error) {
        console.warn('LocalStorage post failed, falling back to API:', error);
      }
    }

    // Fallback to API
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    const collection = getCollectionName(endpoint);
    const id = endpoint.split('/').pop(); // Extract ID from endpoint

    // Update localStorage first
    if (USE_LOCAL_STORAGE && collection && id) {
      try {
        const updatedItem = localStorageService.update(collection, id, data);

        if (updatedItem) {
          console.log(`✅ Updated in localStorage: ${collection}/${id}`);

          return {
            success: true,
            message: `${collection} updated successfully`,
            data: updatedItem
          };
        }
      } catch (error) {
        console.warn('LocalStorage put failed, falling back to API:', error);
      }
    }

    // Fallback to API
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    const collection = getCollectionName(endpoint);
    const id = endpoint.split('/').pop(); // Extract ID from endpoint

    // Delete from localStorage first
    if (USE_LOCAL_STORAGE && collection && id) {
      try {
        const deleted = localStorageService.delete(collection, id);

        if (deleted) {
          console.log(`✅ Deleted from localStorage: ${collection}/${id}`);

          return {
            success: true,
            message: `${collection} deleted successfully`,
            data: { id }
          };
        }
      } catch (error) {
        console.warn('LocalStorage delete failed, falling back to API:', error);
      }
    }

    // Fallback to API
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiService(API_BASE_URL);

export default api;