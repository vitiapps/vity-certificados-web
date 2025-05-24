
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw, ArrowLeft } from 'lucide-react';

interface VerificationFormProps {
  employeeData: any;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  employeeData,
  onVerificationSuccess,
  onBack
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    
    toast({
      title: "¡Código enviado! 📧",
      description: `Se ha enviado un código de verificación a ${employeeData.correo}`,
    });
    
    console.log(`Código de verificación generado: ${newCode}`);
  }, [employeeData.correo, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "¡Ups! 😅",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (code === generatedCode) {
        toast({
          title: "¡Verificación exitosa! 🎉",
          description: "Ahora puedes generar tu certificado",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Código incorrecto 🚫",
          description: "El código ingresado no es válido. Intenta nuevamente.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleResendCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setCode('');
    
    toast({
      title: "¡Código reenviado! 🔄",
      description: `Se ha enviado un nuevo código a ${employeeData.correo}`,
    });
    
    console.log(`Nuevo código de verificación: ${newCode}`);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verificación de Identidad 🔐
          </CardTitle>
          <p className="mt-2 text-white/90">
            ¡Hola <strong>{employeeData.nombre}</strong>! 👋
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              📧 Código enviado a:<br />
              <span className="font-bold text-blue-900">{employeeData.correo}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-gray-700 font-semibold text-lg">
                Código de Verificación 🔢
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-14 text-xl text-center border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 tracking-widest font-mono rounded-xl bg-gray-50/50"
                disabled={isLoading}
                maxLength={6}
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </span>
                ) : (
                  '✅ Verificar Código'
                )}
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleResendCode}
                  className="flex-1 h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border border-yellow-200">
            <p className="text-sm text-yellow-800 font-bold mb-2 text-center">
              💡 Código de prueba
            </p>
            <div className="text-center">
              <span className="font-mono font-bold text-2xl text-yellow-900 bg-white px-4 py-2 rounded-lg inline-block shadow-sm">
                {generatedCode}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationForm;
