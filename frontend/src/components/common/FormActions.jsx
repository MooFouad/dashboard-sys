import React from 'react';

const FormActions = ({ onCancel, submitText = 'Save', isEdit }) => {
return (
<div className="flex gap-3 pt-4">
      <button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
            {isEdit ? 'Update' : submitText}
      </button>
      <button
      type="button"
      onClick={onCancel}
      className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
      >
            Cancel
      </button>
</div>
);
};

export default FormActions;