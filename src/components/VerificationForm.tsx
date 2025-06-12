
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    sendVerificationEmail();
  }, []);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async () => {
    setIsSendingEmail(true);
    const newCode = generateVerificationCode();
    setGeneratedCode(newCode);
    
    try {
      console.log(`Enviando código de verificación: ${newCode} a ${employeeData.correo}`);
      
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          employeeName: employeeData.nombre,
          employeeEmail: employeeData.correo,
          verificationCode: newCode,
          companyName: employeeData.empresa
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setEmailSent(true);
        toast({
          title: "📧 Email enviado",
          description: `Se ha enviado el código de verificación a ${employeeData.correo}`,
        });
      } else {
        throw new Error(data?.message || 'Error al enviar el email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Error al enviar email",
        description: "No se pudo enviar el código. El código aparece en pantalla para pruebas.",
        variant: "destructive"
      });
      
      // Mostrar código en consola como fallback
      console.log(`Código de verificación (fallback): ${newCode}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simular verificación
    setTimeout(() => {
      if (code === generatedCode) {
        toast({
          title: "¡Verificación exitosa!",
          description: "Ahora puedes generar tu certificado",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Código incorrecto",
          description: "El código ingresado no es válido. Intenta nuevamente.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleResendCode = () => {
    sendVerificationEmail();
    setCode('');
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Verificación de Identidad
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Hola <strong>{employeeData.nombre}</strong>
          </p>
          {isSendingEmail ? (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-vity-green mr-2"></div>
              <p className="text-sm text-gray-500">Enviando código...</p>
            </div>
          ) : emailSent ? (
            <p className="text-sm text-gray-500">
              Se ha enviado un código de 6 dígitos a:<br />
              <span className="font-medium">{employeeData.correo}</span>
            </p>
          ) : (
            <p className="text-sm text-orange-600">
              Error al enviar email. Revisa la consola del navegador para el código.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-700 font-medium">
                Código de Verificación
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-12 text-lg text-center border-2 border-gray-200 focus:border-vity-green focus:ring-vity-green/20 tracking-widest font-mono"
                disabled={isLoading || isSendingEmail}
                maxLength={6}
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-12 bg-vity-green hover:bg-vity-green-dark text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading || code.length !== 6 || isSendingEmail}
              >
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleResendCode}
                  className="flex-1 h-10 border-vity-green text-vity-green hover:bg-vity-green/10"
                  disabled={isLoading || isSendingEmail}
                >
                  {isSendingEmail ? 'Enviando...' : 'Reenviar Código'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 h-10"
                  disabled={isLoading || isSendingEmail}
                >
                  Volver
                </Button>
              </div>
            </div>
          </form>
          
          {!emailSent && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                💡 Para probar la aplicación (si el email falla):
              </p>
              <div className="space-y-1">
                <p className="text-xs text-yellow-700">
                  Código de verificación: <span className="font-mono font-bold text-lg text-yellow-900">{generatedCode}</span>
                </p>
                <p className="text-xs text-yellow-600">
                  También aparece en la consola del navegador
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationForm;
