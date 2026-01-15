import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import FormActions from '../common/FormActions';

const AbsherForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    ownerIdNumber: '',
    maker: '',
    model: '',
    modelYear: '',
    majorColor: '',
    renewalExpiryDate: '',
    sequenceNumber: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        plateNumber: initialData.plateNumber || '',
        ownerName: initialData.ownerName || '',
        ownerIdNumber: initialData.ownerIdNumber || '',
        maker: initialData.maker || '',
        model: initialData.model || '',
        modelYear: initialData.modelYear || '',
        majorColor: initialData.majorColor || '',
        renewalExpiryDate: initialData.renewalExpiryDate || initialData.registrationExpiryDate || '',
        sequenceNumber: initialData.sequenceNumber || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      registrationExpiryDate: formData.renewalExpiryDate
    });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plate Number */}
        <FormField label="Plate Number *" required>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.plateNumber}
            onChange={(e) => handleChange('plateNumber', e.target.value)}
            placeholder="e.g. ABC-1234"
            required
          />
        </FormField>

        {/* Sequence Number */}
        <FormField label="Sequence Number">
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.sequenceNumber}
            onChange={(e) => handleChange('sequenceNumber', e.target.value)}
            placeholder="e.g. 12345678"
          />
        </FormField>

        {/* Owner Name */}
        <FormField label="Owner Name *" required>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.ownerName}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            required
          />
        </FormField>

        {/* Owner ID */}
        <FormField label="Owner ID Number">
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.ownerIdNumber}
            onChange={(e) => handleChange('ownerIdNumber', e.target.value)}
            placeholder="e.g. 1023456789"
          />
        </FormField>

        {/* Maker */}
        <FormField label="Maker *" required>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.maker}
            onChange={(e) => handleChange('maker', e.target.value)}
            placeholder="e.g. Toyota"
            required
          />
        </FormField>

        {/* Model */}
        <FormField label="Model *" required>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="e.g. Camry"
            required
          />
        </FormField>

        {/* Model Year */}
        <FormField label="Model Year">
          <input
            type="number"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.modelYear}
            onChange={(e) => handleChange('modelYear', e.target.value)}
            placeholder="e.g. 2020"
            min="1990"
            max="2030"
          />
        </FormField>

        {/* Color */}
        <FormField label="Color">
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.majorColor}
            onChange={(e) => handleChange('majorColor', e.target.value)}
            placeholder="e.g. White"
          />
        </FormField>

        {/* Registration Expiry Date */}
        <FormField label="Registration Expiry Date *" required>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            value={formData.renewalExpiryDate}
            onChange={(e) => handleChange('renewalExpiryDate', e.target.value)}
            required
          />
        </FormField>
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitText={initialData ? 'Update' : 'Create'}
      />
    </form>
  );
};

export default AbsherForm;
