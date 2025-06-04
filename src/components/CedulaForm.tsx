
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabaseEmployeeService } from '@/services/supabaseEmployeeService';

interface CedulaFormProps {
  onCedulaValidated: (cedula: string, employeeData: any) => void;
}

const CedulaForm: React.FC<CedulaFormProps> = ({ onCedulaValidated }) => {
  const [cedula, setCedula] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cedula.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de cédula",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Buscar empleado en Supabase
      const employee = await supabaseEmployeeService.findEmployeeByDocument(cedula.trim());

      if (employee) {
        toast({
          title: "¡Empleado encontrado!",
          description: `Hola ${employee.nombre}, se enviará un código de verificación a tu correo.`,
        });
        onCedulaValidated(cedula, employee);
      } else {
        toast({
          title: "Empleado no encontrado",
          description: "El número de cédula no está registrado en nuestro sistema.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      toast({
        title: "Error",
        description: "Hubo un error al buscar en la base de datos. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Ingresa tu Cédula
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Para generar tu certificación laboral
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cedula" className="text-gray-700 font-medium">
                Número de Cédula
              </Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 1024532077"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="h-12 text-lg border-2 border-gray-200 focus:border-vity-green focus:ring-vity-green/20"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-vity-green hover:bg-vity-green-dark text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? 'Validando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CedulaForm;
