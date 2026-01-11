import React from 'react';

const FormField = ({ label, required, highlight, children }) => {
return (
<div>
      <label className={`block text-sm font-medium mb-1 ${highlight ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
      {label}
      {required && '*'}
      </label>
      {children}
</div>
);
};

export default FormField;