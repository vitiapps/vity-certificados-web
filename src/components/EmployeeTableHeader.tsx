
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const EmployeeTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="min-w-[120px]">Nombre</TableHead>
        <TableHead className="hidden sm:table-cell">Tipo Doc.</TableHead>
        <TableHead>Documento</TableHead>
        <TableHead className="hidden md:table-cell">Correo</TableHead>
        <TableHead className="hidden lg:table-cell">Cargo</TableHead>
        <TableHead className="hidden lg:table-cell">Empresa</TableHead>
        <TableHead className="hidden xl:table-cell">Tipo Contrato</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead className="hidden md:table-cell">Fecha Ingreso</TableHead>
        <TableHead className="hidden xl:table-cell">Fecha Retiro</TableHead>
        <TableHead className="hidden lg:table-cell">Sueldo</TableHead>
        <TableHead className="hidden xl:table-cell">Prom. Salarial</TableHead>
        <TableHead className="hidden xl:table-cell">Prom. No Salarial</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EmployeeTableHeader;
