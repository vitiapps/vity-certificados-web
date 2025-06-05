
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseEmployeeService } from '@/services/supabaseEmployeeService';

interface CertificateGeneratorProps {
  employeeData: any;
  certificateType: string;
  onBack: () => void;
  onStartOver: () => void;
}

interface CompanyCertificateConfig {
  id: string;
  companyName: string;
  logoUrl?: string;
  nit: string;
  city: string;
  signatories: {
    name: string;
    position: string;
    signature?: string;
  }[];
  customText?: string;
  headerColor: string;
  footerText?: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  employeeData,
  certificateType,
  onBack,
  onStartOver
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [companyConfig, setCompanyConfig] = useState<CompanyCertificateConfig | null>(null);
  const { toast } = useToast();

  const certificateTypeNames = {
    'empleado-activo': 'Empleado Activo',
    'empleado-retirado': 'Empleado Retirado',
    'historial-completo': 'Historial Completo'
  };

  useEffect(() => {
    loadCompanyConfig();
    generateCertificate();
  }, []);

  const loadCompanyConfig = () => {
    const saved = localStorage.getItem('certificate_company_configs');
    if (saved) {
      const configs: CompanyCertificateConfig[] = JSON.parse(saved);
      // Buscar configuración que coincida con la empresa del empleado
      const config = configs.find(c => 
        c.companyName.toLowerCase().includes(employeeData.empresa.toLowerCase()) || 
        employeeData.empresa.toLowerCase().includes(c.companyName.toLowerCase())
      );
      setCompanyConfig(config || null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    const generatedCode = `VTY-${employeeData.numero_documento}-${Date.now().toString().slice(-6)}`;
    setVerificationCode(generatedCode);

    setTimeout(async () => {
      setIsGenerating(false);
      setIsGenerated(true);

      console.log('Certificado generado para:', {
        cedula: employeeData.numero_documento,
        nombre: employeeData.nombre,
        empresa: employeeData.empresa,
        estado: employeeData.estado,
        tipoConsulta: certificateType,
        codigo: generatedCode
      });

      await saveCertificateToHistory(generatedCode);

      toast({
        title: "¡Certificado generado!",
        description: "Tu certificado está listo para descargar"
      });
    }, 2000);
  };

  const saveCertificateToHistory = async (code: string) => {
    try {
      const saved = await supabaseEmployeeService.saveCertificationHistory({
        empleado_id: employeeData.id,
        nombre_empleado: employeeData.nombre,
        numero_documento: employeeData.numero_documento,
        tipo_certificacion: certificateType,
        fecha_generacion: new Date().toISOString(),
        generado_por: 'Usuario Web',
        detalles: {
          empresa: employeeData.empresa,
          cargo: employeeData.cargo,
          estado: employeeData.estado,
          sueldo: employeeData.sueldo,
          codigo_verificacion: code
        }
      });

      if (!saved) {
        console.error('Error saving to history');
      }
    } catch (error) {
      console.error('Error saving certificate to history:', error);
    }
  };

  const downloadCertificate = () => {
    try {
      const certificateHTML = generateCertificateHTML();
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado_laboral_${employeeData.numero_documento}_${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "¡Descarga completada!",
        description: "Tu certificado se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error al descargar el certificado:', error);
      toast({
        title: "Error en la descarga",
        description: "Hubo un problema al descargar el certificado. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const generateCertificateHTML = () => {
    const certificateContent = getCertificateContent();
    const currentDate = new Date().toLocaleDateString('es-ES');

    // Usar configuración personalizada si existe, sino usar valores por defecto
    const companyName = companyConfig?.companyName || employeeData.empresa.toUpperCase();
    const nit = companyConfig?.nit || 'NIT: 900.123.456-7';
    const city = companyConfig?.city || 'Bogotá, Colombia';
    const logoUrl = companyConfig?.logoUrl;
    const headerColor = companyConfig?.headerColor || '#22c55e';
    const signatories = companyConfig?.signatories || [];
    const footerText = companyConfig?.footerText;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado Laboral - ${employeeData.nombre}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            background: #f8f9fa;
        }
        .certificate {
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: 1;
            pointer-events: none;
        }
        .watermark img {
            max-width: 800px;
            max-height: 800px;
            width: auto;
            height: auto;
        }
        .certificate-content {
            position: relative;
            z-index: 2;
        }
        .header {
            position: relative;
            border-bottom: 3px solid ${headerColor};
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .logo {
            position: absolute;
            top: 0;
            right: 0;
            max-height: 60px;
            width: auto;
        }
        .company-info {
            max-width: 60%;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: ${headerColor};
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0;
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #374151;
            text-align: justify;
            margin: 30px 0;
            line-height: 1.8;
        }
        .signatures {
            margin-top: 80px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 40px;
        }
        .signature-block {
            text-align: center;
            margin: 20px;
            min-width: 200px;
        }
        .signature-line {
            border-top: 2px solid #333;
            margin-bottom: 10px;
            width: 250px;
        }
        .signature-image {
            max-height: 60px;
            width: auto;
            margin-bottom: 10px;
        }
        .signature-name {
            font-weight: bold;
            font-size: 14px;
        }
        .signature-position {
            font-size: 12px;
            color: #666;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .verification-code {
            font-family: monospace;
            font-size: 12px;
            background: #f3f4f6;
            padding: 5px 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        @media print {
            body { background: white; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        ${logoUrl ? `
        <div class="watermark">
            <img src="${logoUrl}" alt="Watermark" />
        </div>
        ` : ''}
        
        <div class="certificate-content">
            <div class="header">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
                <div class="company-info">
                    <div class="company-name">${companyName}</div>
                    <div style="color: #6b7280;">${nit}</div>
                    <div style="color: #6b7280;">${city}</div>
                </div>
            </div>

            <div style="text-align: center;">
                <h1 class="certificate-title">CERTIFICACIÓN LABORAL</h1>
                <div style="color: #6b7280; margin-bottom: 60px;">
                    Fecha de expedición: ${currentDate}
                </div>
            </div>

            <div class="content">
                ${certificateContent}
            </div>

            ${signatories.length > 0 ? `
            <div class="signatures">
                ${signatories.map(signatory => `
                    <div class="signature-block">
                        ${signatory.signature ? 
                          `<img src="${signatory.signature}" alt="Firma" class="signature-image" />` : 
                          '<div class="signature-line"></div>'
                        }
                        <div class="signature-name">${signatory.name}</div>
                        <div class="signature-position">${signatory.position}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="footer">
                <p>Este certificado es válido con firma digital y código de verificación</p>
                <div class="verification-code">Código: ${verificationCode}</div>
                ${footerText ? `<div style="margin-top: 20px; font-size: 12px; white-space: pre-line;">${footerText}</div>` : ''}
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  const getCertificateContent = () => {
    switch (certificateType) {
      case 'empleado-activo':
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, se encuentra vinculado(a) laboralmente desde el ${formatDate(employeeData.fecha_ingreso)} desempeñando el cargo de ${employeeData.cargo} con un salario de ${formatCurrency(employeeData.sueldo)}, y a la fecha continúa prestando sus servicios de manera activa bajo contrato ${employeeData.tipo_contrato}.`;
      
      case 'empleado-retirado':
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, laboró en la empresa desde el ${formatDate(employeeData.fecha_ingreso)} hasta el ${formatDate(employeeData.fecha_retiro)}, desempeñando el cargo de ${employeeData.cargo} con un salario de ${formatCurrency(employeeData.sueldo)} bajo contrato ${employeeData.tipo_contrato}, fecha en la cual se retiró de la organización.`;
      
      case 'historial-completo':
        const statusText = employeeData.estado === 'ACTIVO' 
          ? `se encuentra vinculado(a) laboralmente desde el ${formatDate(employeeData.fecha_ingreso)} y a la fecha continúa prestando sus servicios` 
          : `laboró en la empresa desde el ${formatDate(employeeData.fecha_ingreso)} hasta el ${formatDate(employeeData.fecha_retiro)}`;
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, ${statusText} desempeñando el cargo de ${employeeData.cargo} con un salario de ${formatCurrency(employeeData.sueldo)} bajo contrato ${employeeData.tipo_contrato}. Estado actual: ${employeeData.estado}.`;
      
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header del certificado */}
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {isGenerated && <CheckCircle className="h-6 w-6 text-vity-green" />}
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isGenerating ? 'Generando Certificado...' : 'Certificado Laboral'}
            </CardTitle>
          </div>
          <Badge className="bg-vity-green">
            {certificateTypeNames[certificateType as keyof typeof certificateTypeNames]}
          </Badge>
        </CardHeader>
      </Card>

      {/* Vista previa del certificado */}
      <Card className="border-0 shadow-xl bg-transparent backdrop-blur-sm">
        <CardContent className="p-8">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vity-green mx-auto mb-4"></div>
              <p className="text-gray-600">Generando tu certificado...</p>
            </div>
          ) : (
            <div className="space-y-6 relative bg-white rounded-lg p-8 shadow-lg">
              {/* Marca de agua de fondo */}
              {companyConfig?.logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
                  <img 
                    src={companyConfig.logoUrl} 
                    alt="Watermark" 
                    className="max-w-[800px] max-h-[800px] transform rotate-45" 
                  />
                </div>
              )}
              
              <div className="relative z-10">
                {/* Encabezado de la empresa con logo en la esquina derecha */}
                <div className="border-b pb-6 relative">
                  {companyConfig?.logoUrl && (
                    <img 
                      src={companyConfig.logoUrl} 
                      alt="Logo" 
                      className="absolute top-0 right-0 h-16 w-auto" 
                    />
                  )}
                  
                  <div className="max-w-[60%]">
                    <h1 className="text-3xl font-bold mb-2" style={{color: companyConfig?.headerColor || '#22c55e'}}>
                      {companyConfig?.companyName || employeeData.empresa.toUpperCase()}
                    </h1>
                    <p className="text-gray-600">{companyConfig?.nit || 'NIT: 900.123.456-7'}</p>
                    <p className="text-gray-600">{companyConfig?.city || 'Bogotá, Colombia'}</p>
                  </div>
                </div>

                {/* Título del certificado */}
                <div className="text-center mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    CERTIFICACIÓN LABORAL
                  </h2>
                  <p className="text-gray-600 mb-12">
                    Fecha de expedición: {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>

                {/* Contenido del certificado */}
                <div className="bg-gray-50 p-6 rounded-lg mb-12">
                  <p className="text-gray-800 leading-relaxed text-justify">
                    {getCertificateContent()}
                  </p>
                </div>

                {/* Firmantes */}
                {companyConfig?.signatories && companyConfig.signatories.length > 0 && (
                  <div className="flex justify-center mt-16">
                    <div className="flex justify-center gap-16 flex-wrap">
                      {companyConfig.signatories.map((signatory, index) => (
                        <div key={index} className="text-center">
                          {signatory.signature ? (
                            <img 
                              src={signatory.signature} 
                              alt="Firma" 
                              className="max-h-16 w-auto mx-auto mb-2" 
                            />
                          ) : (
                            <div className="border-t-2 border-gray-800 w-48 mb-2 mx-auto"></div>
                          )}
                          <p className="font-bold text-sm">{signatory.name}</p>
                          <p className="text-xs text-gray-600">{signatory.position}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pie del certificado */}
                <div className="text-center text-sm text-gray-600 border-t pt-6 mt-12">
                  <p>Este certificado es válido con firma digital y código de verificación</p>
                  <p className="font-mono text-xs mt-2">Código: {verificationCode}</p>
                  {companyConfig?.footerText && (
                    <div className="mt-4 text-xs whitespace-pre-line">
                      {companyConfig.footerText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      {isGenerated && (
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                onClick={downloadCertificate} 
                className="flex-1 h-12 bg-vity-green hover:bg-vity-green-dark text-white font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <Download className="h-5 w-5 mr-2" />
                Descargar Certificado PDF
              </Button>
              
              <Button 
                onClick={onBack} 
                variant="outline" 
                className="h-12 border-vity-green text-vity-green hover:bg-vity-green/10"
              >
                Generar Otro
              </Button>
              
              <Button 
                onClick={onStartOver} 
                variant="outline" 
                className="h-12"
              >
                Nuevo Usuario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificateGenerator;
