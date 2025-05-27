
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  const handleInputChange = (field: keyof Employee, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    // Si la fecha ya está en formato YYYY-MM-DD, la devolvemos tal como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Si está en otro formato, intentamos convertirla
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!employee || !formData) return;

    // Validaciones básicas
    if (!formData.nombre?.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      });
      return;
    }

    if (!formData.numero_documento?.trim()) {
      toast({
        title: "Error",
        description: "El número de documento es requerido",
        variant: "destructive"
      });
      return;
    }

    if (!formData.correo?.trim()) {
      toast({
        title: "Error",
        description: "El correo es requerido",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Datos a actualizar:', formData);
      
      const updateData = {
        nombre: formData.nombre?.trim(),
        numero_documento: formData.numero_documento?.trim(),
        tipo_documento: formData.tipo_documento || 'CC',
        correo: formData.correo?.trim(),
        cargo: formData.cargo?.trim(),
        empresa: formData.empresa?.trim(),
        tipo_contrato: formData.tipo_contrato || 'Indefinido',
        estado: formData.estado || 'Activo',
        fecha_ingreso: formData.fecha_ingreso,
        fecha_retiro: formData.fecha_retiro || null,
        sueldo: formData.sueldo ? Number(formData.sueldo) : null,
        updated_at: new Date().toISOString()
      };

      console.log('Datos finales para actualizar:', updateData);

      const { error } = await supabase
        .from('empleados')
        .update(updateData)
        .eq('id', employee.id);

      if (error) {
        console.error('Error de Supabase:', error);
        toast({
          title: "Error",
          description: `Error al actualizar el empleado: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Actualizado",
          description: "Empleado actualizado correctamente"
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el empleado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Número Documento</label>
            <Input
              value={formData.numero_documento || ''}
              onChange={(e) => handleInputChange('numero_documento', e.target.value)}
              placeholder="Número de documento"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo Documento</label>
            <select
              value={formData.tipo_documento || 'CC'}
              onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="PA">PA</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Correo</label>
            <Input
              type="email"
              value={formData.correo || ''}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              placeholder="correo@empresa.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cargo</label>
            <Input
              value={formData.cargo || ''}
              onChange={(e) => handleInputChange('cargo', e.target.value)}
              placeholder="Cargo"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Empresa</label>
            <Input
              value={formData.empresa || ''}
              onChange={(e) => handleInputChange('empresa', e.target.value)}
              placeholder="Empresa"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo Contrato</label>
            <select
              value={formData.tipo_contrato || 'Indefinido'}
              onChange={(e) => handleInputChange('tipo_contrato', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Indefinido">Indefinido</option>
              <option value="Fijo">Fijo</option>
              <option value="Temporal">Temporal</option>
              <option value="Prestación de servicios">Prestación de servicios</option>
              <option value="Obra o Labor">Obra o Labor</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Estado</label>
            <select
              value={formData.estado || 'Activo'}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Retirado">Retirado</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Fecha Ingreso</label>
            <Input
              type="date"
              value={formatDateForInput(formData.fecha_ingreso || null)}
              onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fecha Retiro (opcional)</label>
            <Input
              type="date"
              value={formatDateForInput(formData.fecha_retiro)}
              onChange={(e) => handleInputChange('fecha_retiro', e.target.value || null)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Sueldo (opcional)</label>
            <Input
              type="number"
              value={formData.sueldo || ''}
              onChange={(e) => handleInputChange('sueldo', e.target.value ? Number(e.target.value) : null)}
              placeholder="Sueldo"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
