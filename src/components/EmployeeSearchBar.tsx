
import React from 'react';
import { Input } from '@/components/ui/input';

interface EmployeeSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const EmployeeSearchBar: React.FC<EmployeeSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <Input
      placeholder="Buscar por nombre, documento, correo o cargo..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full md:max-w-md"
    />
  );
};

export default EmployeeSearchBar;
