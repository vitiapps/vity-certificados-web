
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface EmployeeFormData {
  nombre: string;
  numero_documento: string;
  tipo_documento: string;
  correo: string;
  cargo: string;
  empresa: string;
  tipo_contrato: string;
  estado: string;
  fecha_ingreso: string;
  fecha_retiro?: string;
  sueldo?: number;
}

interface EmployeeDataManagerProps {
  onEmployeeCreated?: () => void;
}

const EmployeeDataManager: React.FC<EmployeeDataManagerProps> = ({ onEmployeeCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EmployeeFormData>({
    defaultValues: {
      nombre: '',
      numero_documento: '',
      tipo_documento: 'CC',
      correo: '',
      cargo: '',
      empresa: '',
      tipo_contrato: 'Indefinido',
      estado: 'Activo',
      fecha_ingreso: '',
      fecha_retiro: '',
      sueldo: 0
    }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      console.log('Datos del empleado a crear:', data);

      const employeeData = {
        nombre: data.nombre.trim(),
        numero_documento: data.numero_documento.trim(),
        tipo_documento: data.tipo_documento,
        correo: data.correo.trim(),
        cargo: data.cargo.trim(),
        empresa: data.empresa.trim(),
        tipo_contrato: data.tipo_contrato,
        estado: data.estado,
        fecha_ingreso: data.fecha_ingreso,
        fecha_retiro: data.fecha_retiro || null,
        sueldo: data.sueldo || null
      };

      const { error } = await supabase
        .from('empleados')
        .insert([employeeData]);

      if (error) {
        console.error('Error de Supabase:', error);
        toast({
          title: "Error",
          description: `Error al crear el empleado: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Empleado creado",
          description: "El empleado se ha creado correctamente"
        });
        form.reset();
        onEmployeeCreated?.();
      }
    } catch (error) {
      console.error('Error inesperado:', error);
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombre"
              rules={{ required: "El nombre es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_documento"
              rules={{ required: "El número de documento es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vity-green focus:border-transparent">
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="PA">PA</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="correo"
              rules={{ 
                required: "El correo es requerido",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Formato de correo inválido"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              rules={{ required: "El cargo es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Cargo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresa"
              rules={{ required: "La empresa es requerida" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_contrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vity-green focus:border-transparent">
                      <option value="Indefinido">Indefinido</option>
                      <option value="Fijo">Fijo</option>
                      <option value="Temporal">Temporal</option>
                      <option value="Prestación de servicios">Prestación de servicios</option>
                      <option value="Obra o Labor">Obra o Labor</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vity-green focus:border-transparent">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Retirado">Retirado</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_ingreso"
              rules={{ required: "La fecha de ingreso es requerida" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Ingreso</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_retiro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Retiro (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sueldo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sueldo (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-vity-green hover:bg-vity-green-dark" 
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Empleado'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeDataManager;
