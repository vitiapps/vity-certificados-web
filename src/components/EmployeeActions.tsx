
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface EmployeeActionsProps {
  employeeCount: number;
  onCreateEmployee: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  employeeCount,
  onCreateEmployee,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800">
        Lista de Empleados ({employeeCount})
      </h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={onCreateEmployee}
          className="bg-vity-green hover:bg-vity-green-dark text-white flex items-center gap-2"
          size="sm"
        >
          <UserPlus size={16} />
          Crear Empleado
        </Button>
        <Button onClick={onRefresh} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>
    </div>
  );
};

export default EmployeeActions;
