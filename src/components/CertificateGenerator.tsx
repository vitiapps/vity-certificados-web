import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseEmployeeService } from '@/services/supabaseEmployeeService';
import { companyConfigService, CompanyCertificateConfig } from '@/services/companyConfigService';
import jsPDF from 'jspdf';

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

  const loadCompanyConfig = async () => {
    try {
      const configs = await companyConfigService.getAllConfigs();
      // Buscar configuración que coincida con la empresa del empleado
      const config = configs.find(c => 
        c.companyName.toLowerCase().includes(employeeData.empresa.toLowerCase()) || 
        employeeData.empresa.toLowerCase().includes(c.companyName.toLowerCase())
      );
      setCompanyConfig(config || null);
    } catch (error) {
      console.error('Error loading company config:', error);
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

  const getSalaryText = () => {
    let salaryText = `un salario de ${formatCurrency(employeeData.sueldo)}`;
    
    const hasSalarialPromedio = employeeData.promedio_salarial_mensual && employeeData.promedio_salarial_mensual > 0;
    const hasNoSalarialPromedio = employeeData.promedio_no_salarial_mensual && employeeData.promedio_no_salarial_mensual > 0;
    
    let total = employeeData.sueldo || 0;
    
    if (hasSalarialPromedio || hasNoSalarialPromedio) {
      salaryText += ' mas';
      
      if (hasSalarialPromedio && hasNoSalarialPromedio) {
        salaryText += ` un promedio salarial mensual de ${formatCurrency(employeeData.promedio_salarial_mensual)} y un promedio no salarial de ${formatCurrency(employeeData.promedio_no_salarial_mensual)}`;
        total += employeeData.promedio_salarial_mensual + employeeData.promedio_no_salarial_mensual;
      } else if (hasSalarialPromedio) {
        salaryText += ` un promedio salarial mensual de ${formatCurrency(employeeData.promedio_salarial_mensual)}`;
        total += employeeData.promedio_salarial_mensual;
      } else if (hasNoSalarialPromedio) {
        salaryText += ` un promedio no salarial de ${formatCurrency(employeeData.promedio_no_salarial_mensual)}`;
        total += employeeData.promedio_no_salarial_mensual;
      }
      
      salaryText += ` para un total de ${formatCurrency(total)}`;
    }
    
    return salaryText;
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
          promedio_salarial_mensual: employeeData.promedio_salarial_mensual,
          promedio_no_salarial_mensual: employeeData.promedio_no_salarial_mensual,
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
      const pdf = new jsPDF();
      
      // Configuración del PDF
      pdf.setFont('helvetica');
      
      // Encabezado de la empresa
      const companyName = companyConfig?.companyName || employeeData.empresa.toUpperCase();
      const nit = companyConfig?.nit || 'NIT: 900.123.456-7';
      const city = companyConfig?.city || 'Bogotá, Colombia';
      
      pdf.setFontSize(20);
      pdf.setTextColor(34, 197, 94); // Verde corporativo
      pdf.text(companyName, 20, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(nit, 20, 40);
      pdf.text(city, 20, 47);
      
      // Línea separadora
      pdf.setDrawColor(34, 197, 94);
      pdf.setLineWidth(1);
      pdf.line(20, 55, 190, 55);
      
      // Título del certificado
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      const title = 'CERTIFICACIÓN LABORAL';
      const titleWidth = pdf.getTextWidth(title);
      const pageWidth = pdf.internal.pageSize.width;
      pdf.text(title, (pageWidth - titleWidth) / 2, 75);
      
      // Fecha de expedición
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('es-ES');
      const dateText = `Fecha de expedición: ${currentDate}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, (pageWidth - dateWidth) / 2, 85);
      
      // Contenido del certificado
      pdf.setFontSize(12);
      const certificateContent = getCertificateContent();
      
      // Dividir el texto en líneas para que quepa en el PDF
      const splitText = pdf.splitTextToSize(certificateContent, 170);
      pdf.text(splitText, 20, 110);
      
      // Calcular la posición Y después del contenido
      const contentHeight = splitText.length * 7;
      let currentY = 110 + contentHeight + 30;
      
      // Firmantes (si existen)
      if (companyConfig?.signatories && companyConfig.signatories.length > 0) {
        const signatureSpacing = 170 / companyConfig.signatories.length;
        
        companyConfig.signatories.forEach((signatory, index) => {
          const xPosition = 20 + (signatureSpacing * index) + (signatureSpacing / 2);
          
          // Línea de firma
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.line(xPosition - 30, currentY, xPosition + 30, currentY);
          
          // Nombre del firmante
          pdf.setFontSize(10);
          const nameWidth = pdf.getTextWidth(signatory.name);
          pdf.text(signatory.name, xPosition - (nameWidth / 2), currentY + 7);
          
          // Cargo del firmante
          pdf.setFontSize(8);
          const positionWidth = pdf.getTextWidth(signatory.position);
          pdf.text(signatory.position, xPosition - (positionWidth / 2), currentY + 14);
        });
        
        currentY += 40;
      }
      
      // Pie de página
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      
      const footerText1 = 'Este certificado es válido con firma digital y código de verificación';
      const footerWidth1 = pdf.getTextWidth(footerText1);
      pdf.text(footerText1, (pageWidth - footerWidth1) / 2, currentY);
      
      const codeText = `Código: ${verificationCode}`;
      const codeWidth = pdf.getTextWidth(codeText);
      pdf.text(codeText, (pageWidth - codeWidth) / 2, currentY + 10);
      
      // Texto de pie personalizado (si existe)
      if (companyConfig?.footerText) {
        pdf.setFontSize(8);
        const footerLines = pdf.splitTextToSize(companyConfig.footerText, 170);
        pdf.text(footerLines, 20, currentY + 25);
      }
      
      // Guardar el PDF
      const fileName = `certificado_laboral_${employeeData.numero_documento}_${Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "¡Descarga completada!",
        description: "Tu certificado PDF se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast({
        title: "Error en la descarga",
        description: "Hubo un problema al generar el PDF. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const getCertificateContent = () => {
    const salaryText = getSalaryText();
    
    switch (certificateType) {
      case 'empleado-activo':
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, se encuentra vinculado(a) laboralmente desde el ${formatDate(employeeData.fecha_ingreso)} desempeñando el cargo de ${employeeData.cargo} con ${salaryText}, y a la fecha continúa prestando sus servicios de manera activa bajo contrato ${employeeData.tipo_contrato}.`;
      
      case 'empleado-retirado':
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, laboró en la empresa desde el ${formatDate(employeeData.fecha_ingreso)} hasta el ${formatDate(employeeData.fecha_retiro)}, desempeñando el cargo de ${employeeData.cargo} con ${salaryText} bajo contrato ${employeeData.tipo_contrato}, fecha en la cual se retiró de la organización.`;
      
      case 'historial-completo':
        const statusText = employeeData.estado === 'ACTIVO' 
          ? `se encuentra vinculado(a) laboralmente desde el ${formatDate(employeeData.fecha_ingreso)} y a la fecha continúa prestando sus servicios` 
          : `laboró en la empresa desde el ${formatDate(employeeData.fecha_ingreso)} hasta el ${formatDate(employeeData.fecha_retiro)}`;
        return `La empresa ${employeeData.empresa} certifica que ${employeeData.nombre}, identificado(a) con ${employeeData.tipo_documento} No. ${employeeData.numero_documento}, ${statusText} desempeñando el cargo de ${employeeData.cargo} con ${salaryText} bajo contrato ${employeeData.tipo_contrato}. Estado actual: ${employeeData.estado}.`;
      
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
