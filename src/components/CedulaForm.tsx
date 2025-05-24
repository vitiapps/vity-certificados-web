
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

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
        title: "¡Ups! 😅",
        description: "Por favor ingresa tu número de cédula",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: employee, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('numero_documento', cedula.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error searching employee:', error);
        toast({
          title: "Error 🔧",
          description: "Hubo un problema al buscar en la base de datos. Intenta nuevamente.",
          variant: "destructive"
        });
        return;
      }

      if (employee) {
        toast({
          title: "¡Perfecto! 🎉",
          description: `Hola ${employee.nombre}, se enviará un código de verificación a tu correo.`,
        });
        onCedulaValidated(cedula, employee);
      } else {
        toast({
          title: "No encontrado 🔍",
          description: "El número de cédula no está registrado en nuestro sistema.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error inesperado 😔",
        description: "Hubo un error inesperado. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            ¡Bienvenido! 👋
          </CardTitle>
          <p className="mt-2 text-white/90">
            Ingresa tu cédula para comenzar
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="cedula" className="text-gray-700 font-semibold text-lg">
                Número de Cédula 🆔
              </Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 1024532077"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="h-14 text-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl bg-gray-50/50"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Validando...
                </span>
              ) : (
                '¡Continuar! 🚀'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CedulaForm;
