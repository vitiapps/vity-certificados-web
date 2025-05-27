import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import EditEmployeeDialog from './EditEmployeeDialog';

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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">
          Lista de Empleados ({filteredEmployees.length})
        </h3>
        <Button onClick={fetchEmployees} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre, documento, correo o cargo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
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
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo Doc.</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo Contrato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Fecha Retiro</TableHead>
                <TableHead>Sueldo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.nombre}</TableCell>
                  <TableCell>{employee.tipo_documento}</TableCell>
                  <TableCell>{employee.numero_documento}</TableCell>
                  <TableCell>{employee.correo}</TableCell>
                  <TableCell>{employee.cargo}</TableCell>
                  <TableCell>{employee.empresa}</TableCell>
                  <TableCell>{employee.tipo_contrato}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      employee.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.estado}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(employee.fecha_ingreso)}</TableCell>
                  <TableCell>{formatDate(employee.fecha_retiro)}</TableCell>
                  <TableCell>{formatCurrency(employee.sueldo)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredEmployees.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">
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
