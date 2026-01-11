import api from './api';
import localStorageService from './localStorageService';

const socialInsuranceService = {
  // Get all social insurance records
  getAll: async (params = {}) => {
    return await api.get('/social-insurance', params);
  },

  // Get single social insurance record by ID
  getById: async (id) => {
    return await api.get(`/social-insurance/${id}`);
  },

  // Create new social insurance record
  create: async (recordData) => {
    return await api.post('/social-insurance', recordData);
  },

  // Update social insurance record
  update: async (id, recordData) => {
    return await api.put(`/social-insurance/${id}`, recordData);
  },

  // Delete social insurance record
  delete: async (id) => {
    return await api.delete(`/social-insurance/${id}`);
  },

  // Bulk delete records
  bulkDelete: async (ids) => {
    return await api.post('/social-insurance/bulk-delete', { ids });
  },

  // Get count
  getCount: async () => {
    const items = localStorageService.findAll('socialInsurance');
    return { count: items ? items.length : 0 };
  }
};

export default socialInsuranceService;
