
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
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
    diagnostics?: any;
  }>({ connected: false });
  const { toast } = useToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando aplicación...');
        
        // Realizar diagnóstico completo de conexión
        const diagnostics = await supabaseEmployeeService.getConnectionDiagnostics();
        console.log('Diagnósticos de conexión:', diagnostics);
        
        if (diagnostics.supabaseReachable) {
          setConnectionStatus({ connected: true });
          toast({
            title: "✅ Sistema listo",
            description: "Base de datos conectada correctamente",
          });
        } else {
          setConnectionStatus({ 
            connected: false, 
            error: diagnostics.errorDetails?.message || 'Error de conexión desconocido',
            diagnostics 
          });
          
          let errorMessage = "No se pudo conectar con la base de datos";
          
          if (!diagnostics.networkConnectivity) {
            errorMessage = "Sin conexión a internet. Verifica tu conexión de red.";
          } else if (diagnostics.errorDetails) {
            errorMessage = `Error de base de datos: ${diagnostics.errorDetails.message}`;
          }
          
          toast({
            title: "⚠️ Error de conexión",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setConnectionStatus({ 
          connected: false, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        });
        
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

  const retryConnection = async () => {
    setIsInitialized(false);
    const diagnostics = await supabaseEmployeeService.getConnectionDiagnostics();
    
    if (diagnostics.supabaseReachable) {
      setConnectionStatus({ connected: true });
      toast({
        title: "✅ Conexión restablecida",
        description: "Base de datos conectada correctamente",
      });
    } else {
      setConnectionStatus({ 
        connected: false, 
        error: diagnostics.errorDetails?.message || 'Error de conexión persistente',
        diagnostics 
      });
      
      toast({
        title: "⚠️ Conexión fallida",
        description: "No se pudo restablecer la conexión",
        variant: "destructive"
      });
    }
    
    setIsInitialized(true);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green flex items-center justify-center">
        <div className="text-white text-xl">Inicializando sistema...</div>
      </div>
    );
  }

  // Mostrar página de error de conexión si no hay conexión
  if (!connectionStatus.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Error de Conexión
                </h1>
                <p className="text-gray-600">
                  No se pudo conectar con la base de datos
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Detalles del error:</h3>
                  <p className="text-sm text-red-700">
                    {connectionStatus.error || 'Error desconocido'}
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Diagnóstico:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      🌐 Conectividad de red: {' '}
                      <span className={connectionStatus.diagnostics?.networkConnectivity ? 'text-green-600' : 'text-red-600'}>
                        {connectionStatus.diagnostics?.networkConnectivity ? 'OK' : 'ERROR'}
                      </span>
                    </li>
                    <li>
                      🗄️ Base de datos: {' '}
                      <span className={connectionStatus.diagnostics?.supabaseReachable ? 'text-green-600' : 'text-red-600'}>
                        {connectionStatus.diagnostics?.supabaseReachable ? 'OK' : 'ERROR'}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <button
                  onClick={retryConnection}
                  className="w-full bg-vity-green hover:bg-vity-green-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🔄 Reintentar Conexión
                </button>
                
                <div className="text-xs text-gray-500 text-center">
                  Si el problema persiste, contacta al administrador del sistema
                </div>
              </div>
            </div>
          </div>
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
