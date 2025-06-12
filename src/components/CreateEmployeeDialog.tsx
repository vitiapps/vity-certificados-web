
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEmployeeDialog: React.FC<CreateEmployeeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    numero_documento: '',
    tipo_documento: 'CC',
    correo: '',
    cargo: '',
    empresa: 'Vity',
    tipo_contrato: 'Indefinido',
    estado: 'Activo',
    fecha_ingreso: '',
    fecha_retiro: '',
    sueldo: '',
    promedio_salarial_mensual: '',
    promedio_no_salarial_mensual: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      numero_documento: '',
      tipo_documento: 'CC',
      correo: '',
      cargo: '',
      empresa: 'Vity',
      tipo_contrato: 'Indefinido',
      estado: 'Activo',
      fecha_ingreso: '',
      fecha_retiro: '',
      sueldo: '',
      promedio_salarial_mensual: '',
      promedio_no_salarial_mensual: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validación básica
      if (!formData.nombre || !formData.numero_documento || !formData.correo || !formData.cargo || !formData.fecha_ingreso) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive"
        });
        return;
      }

      // Preparar datos para inserción
      const dataToInsert = {
        nombre: formData.nombre,
        numero_documento: formData.numero_documento,
        tipo_documento: formData.tipo_documento,
        correo: formData.correo,
        cargo: formData.cargo,
        empresa: formData.empresa,
        tipo_contrato: formData.tipo_contrato,
        estado: formData.estado,
        fecha_ingreso: formData.fecha_ingreso,
        fecha_retiro: formData.fecha_retiro || null,
        sueldo: formData.sueldo ? parseFloat(formData.sueldo) : null,
        promedio_salarial_mensual: formData.promedio_salarial_mensual ? parseFloat(formData.promedio_salarial_mensual) : null,
        promedio_no_salarial_mensual: formData.promedio_no_salarial_mensual ? parseFloat(formData.promedio_no_salarial_mensual) : null,
      };

      const { error } = await supabase
        .from('empleados')
        .insert([dataToInsert]);

      if (error) {
        console.error('Error creating employee:', error);
        toast({
          title: "Error",
          description: "Error al crear el empleado",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado exitosamente"
        });
        resetForm();
        onSuccess();
        onClose();
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Empleado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select value={formData.tipo_documento} onValueChange={(value) => handleInputChange('tipo_documento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PA">Pasaporte</SelectItem>
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
                placeholder="Número de documento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value)}
                placeholder="Cargo del empleado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
              <Select value={formData.tipo_contrato} onValueChange={(value) => handleInputChange('tipo_contrato', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indefinido">Indefinido</SelectItem>
                  <SelectItem value="Temporal">Temporal</SelectItem>
                  <SelectItem value="Obra o Labor">Obra o Labor</SelectItem>
                  <SelectItem value="Prestación de Servicios">Prestación de Servicios</SelectItem>
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
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
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
              <Label htmlFor="fecha_retiro">Fecha de Retiro</Label>
              <Input
                id="fecha_retiro"
                type="date"
                value={formData.fecha_retiro}
                onChange={(e) => handleInputChange('fecha_retiro', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sueldo">Sueldo</Label>
              <Input
                id="sueldo"
                type="number"
                value={formData.sueldo}
                onChange={(e) => handleInputChange('sueldo', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promedio_salarial_mensual">Promedio Salarial Mensual</Label>
              <Input
                id="promedio_salarial_mensual"
                type="number"
                value={formData.promedio_salarial_mensual}
                onChange={(e) => handleInputChange('promedio_salarial_mensual', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promedio_no_salarial_mensual">Promedio No Salarial Mensual</Label>
              <Input
                id="promedio_no_salarial_mensual"
                type="number"
                value={formData.promedio_no_salarial_mensual}
                onChange={(e) => handleInputChange('promedio_no_salarial_mensual', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-vity-green hover:bg-vity-green-dark"
            >
              {isLoading ? 'Creando...' : 'Crear Empleado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
