import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const certificateTypeNames = {
    'empleado-activo': 'Empleado Activo ✅',
    'empleado-retirado': 'Empleado Retirado 📅',
    'historial-completo': 'Historial Completo 📋'
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
    
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      
      console.log('Certificado generado para:', {
        cedula: employeeData.numero_documento,
        nombre: employeeData.nombre,
        empresa: employeeData.empresa,
        estado: employeeData.estado,
        tipoConsulta: certificateType
      });
      
      toast({
        title: "¡Certificado generado! 🎉",
        description: "Tu certificado está listo para descargar",
      });
    }, 2000);
  };

  const downloadCertificate = () => {
    // Create a simple PDF-like content using HTML and download it
    const certificateContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificado Laboral - ${employeeData.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .content { margin: 20px 0; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          .logo { max-width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${employeeData.empresa.toUpperCase()}</h1>
          <p>NIT: 900.123.456-7</p>
          <p>Bogotá, Colombia</p>
          <h2>CERTIFICACIÓN LABORAL</h2>
          <p>Fecha de expedición: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <div class="content">
          <p><strong>Empleado:</strong> ${employeeData.nombre}</p>
          <p><strong>Documento:</strong> ${employeeData.tipo_documento} ${employeeData.numero_documento}</p>
          <p><strong>Cargo:</strong> ${employeeData.cargo}</p>
          <p><strong>Empresa:</strong> ${employeeData.empresa}</p>
          <p><strong>Salario:</strong> ${formatCurrency(employeeData.sueldo)}</p>
          <p><strong>Fecha de ingreso:</strong> ${formatDate(employeeData.fecha_ingreso)}</p>
          ${employeeData.fecha_retiro ? `<p><strong>Fecha de retiro:</strong> ${formatDate(employeeData.fecha_retiro)}</p>` : ''}
          
          <div style="margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            <p>${getCertificateContent()}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Este certificado es válido con firma digital y código de verificación</p>
          <p>Código: VTY-${employeeData.numero_documento}-${Date.now().toString().slice(-6)}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado_${employeeData.numero_documento}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "¡Descarga iniciada! 📥",
      description: "Tu certificado se está descargando como archivo HTML",
    });
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
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white pb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {isGenerated && <CheckCircle className="h-8 w-8" />}
            <Sparkles className="h-8 w-8" />
            <CardTitle className="text-3xl font-bold">
              {isGenerating ? '🔄 Generando Certificado...' : '✨ Certificado Laboral Listo!'}
            </CardTitle>
          </div>
          <div className="text-center">
            <Badge className="bg-white/20 text-white text-lg px-4 py-2 font-bold">
              {certificateTypeNames[certificateType as keyof typeof certificateTypeNames]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-2xl bg-white backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          {isGenerating ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                </div>
              </div>
              <p className="text-xl text-gray-600 font-semibold">✨ Creando tu certificado mágico...</p>
              <p className="text-sm text-gray-500 mt-2">Esto solo tomará unos segundos</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Certificate content with modern styling */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl border-2 border-blue-200">
                <div className="text-center border-b-2 border-blue-300 pb-6 mb-6">
                  <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
                    <img 
                      src="/lovable-uploads/09667bc0-9af8-468b-9c4c-d4844d158bc0.png" 
                      alt="Vity Logo" 
                      className="h-16 w-auto mx-auto"
                    />
                  </div>
                  <h1 className="text-4xl font-bold text-blue-900 mb-2">{employeeData.empresa.toUpperCase()}</h1>
                  <p className="text-blue-700 font-semibold">NIT: 900.123.456-7</p>
                  <p className="text-blue-700">📍 Bogotá, Colombia</p>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">
                    🏆 CERTIFICACIÓN LABORAL
                  </h2>
                  <p className="text-blue-700 font-semibold">
                    📅 Fecha de expedición: {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-inner mb-6">
                  <p className="text-gray-800 leading-relaxed text-justify text-lg">
                    {getCertificateContent()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Employee info cards with gradients */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-blue-600">👤 Empleado:</span>
                    <p className="font-bold text-blue-900">{employeeData.nombre}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-purple-600">🆔 Documento:</span>
                    <p className="font-bold text-purple-900">{employeeData.tipo_documento} {employeeData.numero_documento}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-green-600">💼 Cargo:</span>
                    <p className="font-bold text-green-900">{employeeData.cargo}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-yellow-600">🏢 Empresa:</span>
                    <p className="font-bold text-yellow-900">{employeeData.empresa}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-red-600">📅 Fecha de Ingreso:</span>
                    <p className="font-bold text-red-900">{formatDate(employeeData.fecha_ingreso)}</p>
                  </div>
                  {employeeData.fecha_retiro && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-2xl">
                      <span className="text-sm font-medium text-teal-600">📅 Fecha de Retiro:</span>
                      <p className="font-bold text-teal-900">{formatDate(employeeData.fecha_retiro)}</p>
                    </div>
                  )}
                </div>

                <div className="text-center text-sm text-gray-600 border-t-2 border-blue-200 pt-6 mt-6">
                  <p className="font-semibold">🔒 Este certificado es válido con firma digital y código de verificación</p>
                  <p className="font-mono text-lg mt-2 bg-blue-100 inline-block px-4 py-2 rounded-lg">
                    🆔 VTY-{employeeData.numero_documento}-{Date.now().toString().slice(-6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isGenerated && (
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                onClick={downloadCertificate}
                className="flex-1 h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Download className="h-6 w-6 mr-3" />
                📥 Descargar Certificado
              </Button>
              
              <Button 
                onClick={onBack}
                variant="outline"
                className="h-16 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-2xl font-bold text-lg px-8"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                🔄 Generar Otro
              </Button>
              
              <Button 
                onClick={onStartOver}
                variant="outline"
                className="h-16 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-2xl font-bold text-lg px-8"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                👤 Nuevo Usuario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificateGenerator;
