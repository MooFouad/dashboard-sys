export const getExpiryStatus = (dateString) => {
      // If date is missing or invalid, return 'valid'
      if (!dateString || dateString === '-' || dateString === 'N/A') return 'valid';

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(dateString);
      expiryDate.setHours(0, 0, 0, 0);

      // Check if date is valid
      if (isNaN(expiryDate.getTime())) return 'valid';

      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'expired';
      if (diffDays <= 30) return 'warning';
      return 'valid';
};

export const isExpired = (dateString) => {
      if (!dateString) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expiryDate = new Date(dateString);
      expiryDate.setHours(0, 0, 0, 0);
      
      return expiryDate < today;
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseDate = (dateString) => {
  if (!dateString || dateString === '-' || dateString === 'N/A') return null;

  // Handle ISO date strings (YYYY-MM-DD)
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    return !isNaN(date.getTime()) ? date : null;
  }

  // Handle date objects
  if (dateString instanceof Date) {
    return !isNaN(dateString.getTime()) ? dateString : null;
  }

  // Try parsing other formats
  const parsed = new Date(dateString);
  return !isNaN(parsed.getTime()) ? parsed : null;
};

export const formatDate = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateRemainingDays = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

