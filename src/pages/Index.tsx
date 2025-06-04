
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CedulaForm from '@/components/CedulaForm';
import VerificationForm from '@/components/VerificationForm';
import CertificateOptions from '@/components/CertificateOptions';
import CertificateGenerator from '@/components/CertificateGenerator';
import { supabaseEmployeeService } from '@/services/supabaseEmployeeService';
import { useToast } from '@/hooks/use-toast';

type AppStep = 'cedula' | 'verification' | 'options' | 'certificate';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('cedula');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [selectedCertificateType, setSelectedCertificateType] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Probar la conexión con Supabase
        const connectionSuccess = await supabaseEmployeeService.testConnection();
        
        if (connectionSuccess) {
          toast({
            title: "✅ Sistema listo",
            description: "Base de datos conectada correctamente",
          });
        } else {
          toast({
            title: "⚠️ Error de conexión",
            description: "No se pudo conectar con la base de datos",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          title: "Error",
          description: "Error al inicializar la aplicación",
          variant: "destructive"
        });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [toast]);

  const handleCedulaValidated = (cedula: string, data: any) => {
    setEmployeeData(data);
    setCurrentStep('verification');
  };

  const handleVerificationSuccess = () => {
    setCurrentStep('options');
  };

  const handleGenerateCertificate = (type: string) => {
    setSelectedCertificateType(type);
    setCurrentStep('certificate');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'verification':
        setCurrentStep('cedula');
        break;
      case 'options':
        setCurrentStep('verification');
        break;
      case 'certificate':
        setCurrentStep('options');
        break;
      default:
        setCurrentStep('cedula');
    }
  };

  const handleStartOver = () => {
    setCurrentStep('cedula');
    setEmployeeData(null);
    setSelectedCertificateType('');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green flex items-center justify-center">
        <div className="text-white text-xl">Inicializando sistema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'cedula' && (
          <CedulaForm onCedulaValidated={handleCedulaValidated} />
        )}
        
        {currentStep === 'verification' && employeeData && (
          <VerificationForm
            employeeData={employeeData}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'options' && employeeData && (
          <CertificateOptions
            employeeData={employeeData}
            onGenerateCertificate={handleGenerateCertificate}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'certificate' && employeeData && selectedCertificateType && (
          <CertificateGenerator
            employeeData={employeeData}
            certificateType={selectedCertificateType}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        )}
      </main>
      
      <footer className="bg-white/10 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-white/90 text-sm">
            📞 <strong>Contáctanos:</strong> coordinador.nomina@mvitales.com | +57 3213556969
          </p>
          <p className="text-white/70 text-xs mt-2">
            Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
