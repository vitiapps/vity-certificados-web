
import React, { useState } from 'react';
import Header from '@/components/Header';
import CedulaForm from '@/components/CedulaForm';
import VerificationForm from '@/components/VerificationForm';
import CertificateOptions from '@/components/CertificateOptions';
import CertificateGenerator from '@/components/CertificateGenerator';

type AppStep = 'cedula' | 'verification' | 'options' | 'certificate';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('cedula');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [selectedCertificateType, setSelectedCertificateType] = useState<string>('');

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
      
      {/* Footer informativo */}
      <footer className="bg-white/10 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-white/90 text-sm">
            💡 <strong>Próximos pasos:</strong> Conecta con Google Sheets para la base de datos automática
          </p>
          <p className="text-white/70 text-xs mt-2">
            Esta es una versión de demostración • Los datos mostrados son de ejemplo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
