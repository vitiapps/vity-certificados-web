
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody } from '@/components/ui/table';
import EditEmployeeDialog from './EditEmployeeDialog';
import CreateEmployeeDialog from './CreateEmployeeDialog';
import EmployeeTableRow from './EmployeeTableRow';
import EmployeeSearchBar from './EmployeeSearchBar';
import EmployeeTableHeader from './EmployeeTableHeader';
import EmployeeActions from './EmployeeActions';

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

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const handleCreateEmployee = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEmployeeCreated = () => {
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <EmployeeActions
        employeeCount={filteredEmployees.length}
        onCreateEmployee={handleCreateEmployee}
        onRefresh={fetchEmployees}
        isLoading={isLoading}
      />

      <EmployeeSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando empleados...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <EmployeeTableHeader />
            <TableBody>
              {filteredEmployees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEditEmployee}
                  onDelete={deleteEmployee}
                />
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

      <CreateEmployeeDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleEmployeeCreated}
      />
    </div>
  );
};

export default EmployeeList;
