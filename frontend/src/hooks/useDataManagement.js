import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const STORAGE_PREFIX = 'gts_dashboard_';
const COLLECTION_MAP = {
  homeRent: 'homeRents',
  vehicle: 'vehicles',
  electricity: 'electricity',
  absher: 'absher',
  socialInsurance: 'socialInsurance',
  gosi: 'gosi',
};

// Read data synchronously from localStorage to avoid loading flash
const getInitialData = (type) => {
  try {
    const collection = COLLECTION_MAP[type];
    if (!collection) return null;
    const raw = localStorage.getItem(STORAGE_PREFIX + collection);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through
  }
  return null;
};

// Enrich socialInsurance items with calculated fields (used for synchronous init)
const enrichInitialData = (items) => {
  return items.map(item => {
    if (item.remainingDays !== undefined && item.remainingDays !== null && item.status) {
      return item;
    }
    let remainingDays = null;
    let status = null;
    if (item.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(item.endDate);
      endDate.setHours(0, 0, 0, 0);
      remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      if (remainingDays < 0) status = 'expired';
      else if (remainingDays <= 30) status = 'expiring-soon';
      else status = 'active';
    }
    return { ...item, remainingDays, status: status || item.status };
  });
};

export const useDataManagement = (type, options = {}) => {
  const { usePagination = true, defaultPageSize = 25, searchTerm = '', filterStatus = 'all' } = options;

  const cachedData = useRef(getInitialData(type));
  const initialData = useRef(cachedData.current);
  const [data, setData] = useState(() => {
    if (!cachedData.current) return [];
    // Enrich socialInsurance data on init
    if (type === 'socialInsurance') return enrichInitialData(cachedData.current);
    return cachedData.current;
  });
  const [loading, setLoading] = useState(!cachedData.current);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getEndpoint = (type) => {
    switch(type) {
      case 'homeRent':
        return '/home-rents'; // Match backend route
      case 'vehicle':
        return '/vehicles';
      case 'electricity':
        return '/electricity';
      case 'absher':
        return '/absher';
      case 'socialInsurance':
        return '/social-insurance'; // Match backend route
      case 'gosi':
        return '/gosi'; // GOSI endpoint
      default:
        return `/${type}s`;
    }
  };

  // Calculate remainingDays and status for records that don't have them
  const enrichData = (items, dataType) => {
    if (dataType !== 'socialInsurance') return items;

    return items.map(item => {
      // If already has remainingDays and status, return as is
      if (item.remainingDays !== undefined && item.remainingDays !== null && item.status) {
        return item;
      }

      // Calculate missing fields
      let remainingDays = null;
      let status = null;

      if (item.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(item.endDate);
        endDate.setHours(0, 0, 0, 0);

        remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (remainingDays < 0) {
          status = 'expired';
        } else if (remainingDays <= 30) {
          status = 'expiring-soon';
        } else {
          status = 'active';
        }
      }

      return {
        ...item,
        remainingDays,
        status: status || item.status
      };
    });
  };

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const endpoint = getEndpoint(type);

      // Build query params for pagination and search
      const params = usePagination
        ? { page: currentPage, limit: pageSize }
        : { limit: 100000 }; // Fetch all items when pagination is disabled

      // Add search term if provided
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add status filter if provided and not 'all'
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await api.get(endpoint, params);

      // Handle paginated response format: { success: true, data: [...], pagination: {...} }
      if (response?.pagination) {
        const enrichedData = enrichData(Array.isArray(response.data) ? response.data : [], type);
        setData(enrichedData);
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.pages);
      } else {
        // Handle non-paginated response format: { success: true, data: [...] }
        const items = response?.data || response;
        const enrichedData = enrichData(Array.isArray(items) ? items : [], type);
        setData(enrichedData);
        setTotalItems(Array.isArray(items) ? items.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(err.message);
      setData([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [type, currentPage, pageSize, usePagination, searchTerm, filterStatus]);

  useEffect(() => {
    // If we loaded initial data synchronously, do a background refresh without showing spinner
    if (initialData.current) {
      initialData.current = null; // Only skip loading indicator on first mount
      fetchData(false);
    } else {
      fetchData(true);
    }
  }, [fetchData]);

  const addItem = useCallback(async (data) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.post(endpoint, data);
      // Handle new response format: { success: true, data: {...} }
      const item = response?.data || response;
      setData(prev => [...prev, item]);
      return item;
    } catch (err) {
      throw new Error(`Failed to add ${type}: ${err.message}`);
    }
  }, [type]);

  const updateItem = useCallback(async (id, updatedItem) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.put(`${endpoint}/${id}`, updatedItem);
      // Handle new response format: { success: true, data: {...} }
      const updatedData = response?.data || response;
      setData(prev => prev.map(item => item._id === id ? updatedData : item));
      return updatedData;
    } catch (err) {
      throw new Error(`Failed to update ${type}: ${err.message}`);
    }
  }, [type]);

  const deleteItem = useCallback(async (id) => {
    try {
      const endpoint = getEndpoint(type);
      await api.delete(`${endpoint}/${id}`);
      setData(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      throw new Error(`Failed to delete ${type}: ${err.message}`);
    }
  }, [type]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  // Reset to page 1 when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshData: fetchData,
    // Pagination
    pagination: usePagination ? {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange
    } : null
  };
};