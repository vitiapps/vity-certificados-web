import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import EditEmployeeDialog from './EditEmployeeDialog';
import CreateEmployeeDialog from './CreateEmployeeDialog';

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
  created_at: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filtrar empleados basado en el término de búsqueda
    const filtered = employees.filter(emp => 
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.numero_documento.includes(searchTerm) ||
      emp.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Error al cargar los empleados",
          variant: "destructive"
        });
      } else {
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los empleados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('empleados')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Error al eliminar el empleado",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Eliminado",
          description: "Empleado eliminado correctamente"
        });
        fetchEmployees();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleEmployeeUpdate = () => {
    fetchEmployees();
  };

  const handleEmployeeCreated = () => {
    fetchEmployees();
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
          Lista de Empleados ({filteredEmployees.length})
        </h3>
        <div className="flex gap-2">
          <CreateEmployeeDialog onEmployeeCreated={handleEmployeeCreated} />
          <Button onClick={fetchEmployees} disabled={isLoading} size="sm">
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      <Input
        placeholder="Buscar por nombre, documento, correo o cargo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:max-w-md"
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando empleados...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
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
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Edit size={12} />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEmployee(employee.id)}
                        className="text-xs"
                      >
                        <span className="hidden sm:inline">Eliminar</span>
                        <span className="sm:hidden">×</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredEmployees.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm md:text-base">
                {searchTerm ? 'No se encontraron empleados con ese criterio de búsqueda' : 'No hay empleados registrados'}
              </p>
            </div>
          )}
        </div>
      )}

      <EditEmployeeDialog
        employee={editingEmployee}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onUpdate={handleEmployeeUpdate}
      />
    </div>
  );
};

export default EmployeeList;
