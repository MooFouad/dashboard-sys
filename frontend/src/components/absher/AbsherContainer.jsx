import React, { useState, useEffect } from 'react';
import AbsherTable from './AbsherTable';
import AbsherForm from './AbsherForm';
import FormDialog from '../common/FormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import Toolbar from '../layout/Toolbar';
import ExportButton from '../common/ExportButton';
import Pagination from '../common/Pagination';
import { useDataManagement } from '../../hooks/useDataManagement';
import { exportAbsherToExcel } from '../../utils/excel/excelUtils';

const AbsherContainer = () => {
  const [formDialog, setFormDialog] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Use the same data management hook as other containers
  const { data: items, addItem, updateItem, deleteItem, loading, error, refreshData } = useDataManagement('absher');

  // Dispatch count update when items change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('itemCountUpdate', {
      detail: { type: 'absher', count: items.length }
    }));
  }, [items]);

  // Filter items based on search and status
  const filteredItems = items.filter((item) => {
    const matchSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );

    let matchStatus = true;
    if (filterStatus !== 'all') {
      const expiryDate = item.renewalExpiryDate || item.registrationExpiryDate;
      if (expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const isExpired = expiry < today;
        const isWarning = expiry <= thirtyDaysFromNow && !isExpired;

        if (filterStatus === 'expired') matchStatus = isExpired;
        else if (filterStatus === 'warning') matchStatus = isWarning;
        else if (filterStatus === 'valid') matchStatus = !isExpired && !isWarning;
      }
    }

    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    setFormDialog({ isOpen: true, data: null });
  };

  const handleEdit = (vehicle) => {
    setFormDialog({ isOpen: true, data: vehicle });
  };

  const handleSubmit = async (formData) => {
    try {
      if (formDialog.data) {
        await updateItem(formDialog.data._id, {
          ...formData,
          _id: formDialog.data._id
        });
      } else {
        await addItem(formData);
      }
      setFormDialog({ isOpen: false, data: null });
      await refreshData();
    } catch (err) {
      console.error('Form submission error:', err);
      alert(`Error: ${err.message || 'Failed to save changes.'}`);
    }
  };

  const handleDelete = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteDialog.id !== null) {
      await deleteItem(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null });
      await refreshData();
    }
  };

  const handleExport = () => {
    try {
      exportAbsherToExcel(filteredItems);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data to Excel.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Tamm - Istemarah ({items.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle Registration Management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton onClick={handleExport} label="Export to Excel" />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        totalItems={filteredItems.length}
        statusOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'valid', label: 'Valid' },
          { value: 'warning', label: 'Warning - 30 days' },
          { value: 'expired', label: 'Expired' }
        ]}
        searchPlaceholder="Search vehicles..."
      />

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No vehicle records found.</p>
          <p className="text-sm">Click "+ Add Vehicle" to add a new record.</p>
        </div>
      ) : (
        <AbsherTable
          data={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <FormDialog
        isOpen={formDialog.isOpen}
        title={formDialog.data ? 'Edit Vehicle' : 'Add New Vehicle'}
        onClose={() => setFormDialog({ isOpen: false, data: null })}
      >
        <AbsherForm
          initialData={formDialog.data}
          onSubmit={handleSubmit}
          onCancel={() => setFormDialog({ isOpen: false, data: null })}
        />
      </FormDialog>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default AbsherContainer;
