
import React from 'react';
import ExcelUploader from './ExcelUploader';
import ExcelDownloader from './ExcelDownloader';

const EmployeeDataManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <ExcelUploader />
      <ExcelDownloader />
    </div>
  );
};

export default EmployeeDataManager;
