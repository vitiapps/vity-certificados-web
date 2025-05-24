
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle } from 'lucide-react';
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
    // Auto-generar el certificado al cargar el componente
    generateCertificate();
  }, []);

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    // Simular generación del certificado
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
        title: "¡Certificado generado!",
        description: "Tu certificado está listo para descargar",
      });
    }, 2000);
  };

  const downloadCertificate = () => {
    // En una implementación real, aquí se generaría y descargaría el PDF
    toast({
      title: "Descarga iniciada",
      description: "Tu certificado se está descargando...",
    });
    
    // Simular descarga
    const link = document.createElement('a');
    link.href = '#'; // En la implementación real sería la URL del PDF generado
    link.download = `certificado_${employeeData.numero_documento}_${Date.now()}.pdf`;
    // link.click(); // Comentado para no activar descarga real en la demo
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

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-blue-50 p-4 rounded-lg">
                <div>
                  <span className="font-medium text-blue-800">Empleado:</span>
                  <p className="text-blue-700">{employeeData.nombre}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Documento:</span>
                  <p className="text-blue-700">{employeeData.tipo_documento} {employeeData.numero_documento}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Cargo:</span>
                  <p className="text-blue-700">{employeeData.cargo}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Empresa:</span>
                  <p className="text-blue-700">{employeeData.empresa}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Fecha de ingreso:</span>
                  <p className="text-blue-700">{formatDate(employeeData.fecha_ingreso)}</p>
                </div>
                {employeeData.fecha_retiro && (
                  <div>
                    <span className="font-medium text-blue-800">Fecha de retiro:</span>
                    <p className="text-blue-700">{formatDate(employeeData.fecha_retiro)}</p>
                  </div>
                )}
              </div>

              {/* Pie del certificado */}
              <div className="text-center text-sm text-gray-600 border-t pt-6">
                <p>Este certificado es válido con firma digital y código de verificación</p>
                <p className="font-mono text-xs mt-2">Código: VTY-{employeeData.numero_documento}-{Date.now().toString().slice(-6)}</p>
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
