
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';

interface CreateEmployeeDialogProps {
  onEmployeeCreated: () => void;
}

const CreateEmployeeDialog: React.FC<CreateEmployeeDialogProps> = ({ onEmployeeCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tipo_documento: 'CC',
    numero_documento: '',
    nombre: '',
    correo: '',
    cargo: '',
    empresa: '',
    tipo_contrato: '',
    estado: 'ACTIVO',
    fecha_ingreso: '',
    sueldo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numero_documento || !formData.nombre || !formData.correo || !formData.cargo || !formData.empresa || !formData.tipo_contrato || !formData.fecha_ingreso) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const employeeData = {
        ...formData,
        sueldo: formData.sueldo ? parseFloat(formData.sueldo) : null
      };

      const { error } = await supabase
        .from('empleados')
        .insert([employeeData]);

      if (error) {
        console.error('Error creating employee:', error);
        toast({
          title: "Error",
          description: "Error al crear el empleado: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente"
        });
        
        // Reset form
        setFormData({
          tipo_documento: 'CC',
          numero_documento: '',
          nombre: '',
          correo: '',
          cargo: '',
          empresa: '',
          tipo_contrato: '',
          estado: 'ACTIVO',
          fecha_ingreso: '',
          sueldo: ''
        });
        
        setIsOpen(false);
        onEmployeeCreated();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el empleado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          Nuevo Empleado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Empleado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select value={formData.tipo_documento} onValueChange={(value) => handleInputChange('tipo_documento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PAS">Pasaporte</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número de Documento *</Label>
              <Input
                id="numero_documento"
                value={formData.numero_documento}
                onChange={(e) => handleInputChange('numero_documento', e.target.value)}
                placeholder="Ingrese el número de documento"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ingrese el nombre completo"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                placeholder="Ingrese el correo electrónico"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value)}
                placeholder="Ingrese el cargo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa *</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                placeholder="Ingrese la empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_contrato">Tipo de Contrato *</Label>
              <Select value={formData.tipo_contrato} onValueChange={(value) => handleInputChange('tipo_contrato', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDEFINIDO">Indefinido</SelectItem>
                  <SelectItem value="FIJO">Término Fijo</SelectItem>
                  <SelectItem value="OBRA_LABOR">Obra o Labor</SelectItem>
                  <SelectItem value="PRESTACION_SERVICIOS">Prestación de Servicios</SelectItem>
                  <SelectItem value="APRENDIZAJE">Aprendizaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
              <Input
                id="fecha_ingreso"
                type="date"
                value={formData.fecha_ingreso}
                onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sueldo">Sueldo</Label>
              <Input
                id="sueldo"
                type="number"
                value={formData.sueldo}
                onChange={(e) => handleInputChange('sueldo', e.target.value)}
                placeholder="Ingrese el sueldo (opcional)"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Empleado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
