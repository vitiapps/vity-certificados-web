import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CedulaForm from '@/components/CedulaForm';
import VerificationForm from '@/components/VerificationForm';
import CertificateOptions from '@/components/CertificateOptions';
import CertificateGenerator from '@/components/CertificateGenerator';
import GoogleSheetsSetup from '@/components/GoogleSheetsSetup';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useToast } from '@/hooks/use-toast';

type AppStep = 'setup' | 'cedula' | 'verification' | 'options' | 'certificate';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('setup');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [selectedCertificateType, setSelectedCertificateType] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Las credenciales ya están configuradas en el constructor del servicio
        const isConfigured = googleSheetsService.isConfigured();
        
        if (isConfigured) {
          // Probar la conexión
          const connectionSuccess = await googleSheetsService.testConnection();
          
          if (connectionSuccess) {
            setCurrentStep('cedula');
            toast({
              title: "✅ Sistema listo",
              description: "Google Sheets configurado correctamente",
            });
          } else {
            // Si no se puede conectar, intentar crear los datos de ejemplo
            try {
              await googleSheetsService.createSampleData();
              setCurrentStep('cedula');
              toast({
                title: "🎉 ¡Sistema configurado!",
                description: "Se crearon los datos de ejemplo en Google Sheets",
              });
            } catch (error) {
              setCurrentStep('setup');
              toast({
                title: "⚠️ Configuración necesaria",
                description: "Necesitas configurar tu propia hoja de Google Sheets",
                variant: "destructive"
              });
            }
          }
        } else {
          setCurrentStep('setup');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setCurrentStep('setup');
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

  const handleSetupComplete = () => {
    setCurrentStep('cedula');
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
        {currentStep === 'setup' && (
          <GoogleSheetsSetup onSetupComplete={handleSetupComplete} />
        )}
        
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
