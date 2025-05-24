
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-green-300/10 rounded-full blur-2xl animate-bounce"></div>
      
      <div className="relative z-10">
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
      </div>
    </div>
  );
};

export default Index;
