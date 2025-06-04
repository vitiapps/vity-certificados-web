import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';

interface CertificateGeneratorProps {
  employeeData: any;
  certificateType: string;
  onBack: () => void;
  onStartOver: () => void;
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
  const { toast } = useToast();

  const certificateTypeNames = {
    'empleado-activo': 'Empleado Activo',
    'empleado-retirado': 'Empleado Retirado',
    'historial-completo': 'Historial Completo'
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

  useEffect(() => {
    generateCertificate();
  }, []);

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
        description: "Tu certificado está listo para descargar",
      });
    }, 2000);
  };

  const saveCertificateToHistory = async (code: string) => {
    try {
      const saved = await googleSheetsService.saveCertificationHistory({
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
        description: "Tu certificado se ha descargado correctamente",
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
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #22c55e;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0;
        }
        .content {
            font-size: 16px;
            color: #374151;
            text-align: justify;
            margin: 30px 0;
            line-height: 1.8;
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
        <div class="header">
            <div class="company-name">${employeeData.empresa.toUpperCase()}</div>
            <div style="color: #6b7280;">NIT: 900.123.456-7</div>
            <div style="color: #6b7280;">Bogotá, Colombia</div>
        </div>

        <div style="text-align: center;">
            <h1 class="certificate-title">CERTIFICACIÓN LABORAL</h1>
            <div style="color: #6b7280; margin-bottom: 40px;">
                Fecha de expedición: ${currentDate}
            </div>
        </div>

        <div class="content">
            ${certificateContent}
        </div>

        <div class="footer">
            <p>Este certificado es válido con firma digital y código de verificación</p>
            <div class="verification-code">Código: ${verificationCode}</div>
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
      <Card className="border-0 shadow-xl bg-white backdrop-blur-sm">
        <CardContent className="p-8">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vity-green mx-auto mb-4"></div>
              <p className="text-gray-600">Generando tu certificado...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado de la empresa */}
              <div className="text-center border-b pb-6">
                <img 
                  src="/lovable-uploads/09667bc0-9af8-468b-9c4c-d4844d158bc0.png" 
                  alt="Vity Logo" 
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-vity-green mb-2">{employeeData.empresa.toUpperCase()}</h1>
                <p className="text-gray-600">NIT: 900.123.456-7</p>
                <p className="text-gray-600">Bogotá, Colombia</p>
              </div>

              {/* Título del certificado */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  CERTIFICACIÓN LABORAL
                </h2>
                <p className="text-gray-600">
                  Fecha de expedición: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>

              {/* Contenido del certificado */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-800 leading-relaxed text-justify">
                  {getCertificateContent()}
                </p>
              </div>

              {/* Pie del certificado */}
              <div className="text-center text-sm text-gray-600 border-t pt-6">
                <p>Este certificado es válido con firma digital y código de verificación</p>
                <p className="font-mono text-xs mt-2">Código: {verificationCode}</p>
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
