import React from 'react';
import { X } from 'lucide-react';
import AttachmentField from './AttachmentField';

const AttachmentsDialog = ({ isOpen, onClose, attachments }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attachments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <AttachmentField
          attachments={attachments}
          onChange={() => {}} // Read-only in dialog
          preview={true}
        />
      </div>
    </div>
  );
};

export default AttachmentsDialog;