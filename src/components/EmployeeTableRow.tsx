
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';

interface Employee {
  id: string;
  nombre: string;
  numero_documento: string;
  tipo_documento: string;
  correo: string;
  cargo: string;
  empresa: string;
  tipo_contrato: string;
  estado: string;
  fecha_ingreso: string;
  fecha_retiro: string | null;
  sueldo: number | null;
  promedio_salarial_mensual: number | null;
  promedio_no_salarial_mensual: number | null;
  created_at: string;
}

interface EmployeeTableRowProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <TableRow>
      <TableCell className="font-medium min-w-[120px]">{employee.nombre}</TableCell>
      <TableCell className="hidden sm:table-cell">{employee.tipo_documento}</TableCell>
      <TableCell>{employee.numero_documento}</TableCell>
      <TableCell className="hidden md:table-cell">{employee.correo}</TableCell>
      <TableCell className="hidden lg:table-cell">{employee.cargo}</TableCell>
      <TableCell className="hidden lg:table-cell">{employee.empresa}</TableCell>
      <TableCell className="hidden xl:table-cell">{employee.tipo_contrato}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          employee.estado.toUpperCase() === 'ACTIVO' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-800'
        }`}>
          {employee.estado}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">{formatDate(employee.fecha_ingreso)}</TableCell>
      <TableCell className="hidden xl:table-cell">{formatDate(employee.fecha_retiro)}</TableCell>
      <TableCell className="hidden lg:table-cell">{formatCurrency(employee.sueldo)}</TableCell>
      <TableCell className="hidden xl:table-cell">{formatCurrency(employee.promedio_salarial_mensual)}</TableCell>
      <TableCell className="hidden xl:table-cell">{formatCurrency(employee.promedio_no_salarial_mensual)}</TableCell>
      <TableCell>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="flex items-center gap-1 text-xs"
          >
            <Edit size={12} />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(employee.id)}
            className="text-xs"
          >
            <span className="hidden sm:inline">Eliminar</span>
            <span className="sm:hidden">×</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmployeeTableRow;
