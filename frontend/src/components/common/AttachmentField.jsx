import React from 'react';
import { Paperclip, X, Eye } from 'lucide-react';

const AttachmentField = ({ attachments = [], onChange, preview = false }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map(file => {
      // Create a base64 URL for the file
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            url: reader.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    });

    // Wait for all files to be processed
    Promise.all(fileObjects).then(newFiles => {
      onChange([...attachments, ...newFiles]);
    });
  };

  const handleRemove = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onChange(newAttachments);
  };

  const handlePreview = (url) => {
    if (url.startsWith('data:')) {
      // For base64 URLs, open in new window
      const win = window.open();
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>File Preview</title>
            <style>
              body { margin: 0; }
              .preview-container { 
                width: 100vw; 
                height: 100vh; 
                display: flex;
                justify-content: center;
                align-items: center;
                background: #f3f4f6;
              }
              img, iframe { 
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <div class="preview-container">
              ${url.startsWith('data:image/') 
                ? `<img src="${url}" alt="Preview" />`
                : `<iframe src="${url}" frameborder="0" style="width:100%;height:100vh;" allowfullscreen></iframe>`
              }
            </div>
          </body>
        </html>
      `);
    } else {
      // For blob URLs or regular URLs
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      {!preview && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors duration-200">
            <Paperclip size={16} />
            <span>Add Attachments</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
          </label>
        </div>
      )}

      {attachments?.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments ({attachments.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <Paperclip size={16} className="text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(file.url)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Eye size={16} />
                  </button>
                  {!preview && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentField;