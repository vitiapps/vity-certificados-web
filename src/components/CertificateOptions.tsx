
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';

interface CertificateOptionsProps {
  employeeData: any;
  onGenerateCertificate: (type: string) => void;
  onBack: () => void;
}

const CertificateOptions: React.FC<CertificateOptionsProps> = ({
  employeeData,
  onGenerateCertificate,
  onBack
}) => {
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

  // Función para verificar si el empleado está activo de manera más flexible
  const isActiveEmployee = (status: string): boolean => {
    return status.toUpperCase().includes('ACTIV');
  };

  // Función para verificar si el empleado está retirado de manera más flexible
  const isRetiredEmployee = (status: string): boolean => {
    return status.toUpperCase().includes('RETIR') || 
           status.toUpperCase().includes('INACTIV');
  };

  const certificateTypes = [
    {
      id: 'empleado-activo',
      title: 'Empleado Activo',
      description: 'Certificado de vinculación laboral actual',
      icon: User,
      color: 'bg-green-500',
      available: isActiveEmployee(employeeData.estado)
    },
    {
      id: 'empleado-retirado',
      title: 'Empleado Retirado',
      description: 'Certificado de desvinculación laboral',
      icon: Calendar,
      color: 'bg-blue-500',
      available: isRetiredEmployee(employeeData.estado)
    },
    {
      id: 'historial-completo',
      title: 'Historial Completo',
      description: 'Certificado con toda la información laboral',
      icon: FileText,
      color: 'bg-purple-500',
      available: true
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-6">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Información del Empleado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Nombre:</span>
              <p className="font-semibold text-gray-800">{employeeData.nombre}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Documento:</span>
              <p className="font-semibold text-gray-800">{employeeData.tipo_documento} {employeeData.numero_documento}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Cargo:</span>
              <p className="font-semibold text-gray-800">{employeeData.cargo}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Empresa:</span>
              <p className="font-semibold text-gray-800">{employeeData.empresa}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Estado:</span>
              <Badge 
                variant={isActiveEmployee(employeeData.estado) ? 'default' : 'secondary'}
                className={isActiveEmployee(employeeData.estado) ? 'bg-vity-green' : 'bg-gray-500'}
              >
                {employeeData.estado}
              </Badge>
            </div>
            <div>
              <span className="font-medium text-gray-600">Salario:</span>
              <p className="font-semibold text-gray-800">{formatCurrency(employeeData.sueldo)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fecha de Ingreso:</span>
              <p className="font-semibold text-gray-800">{formatDate(employeeData.fecha_ingreso)}</p>
            </div>
            {employeeData.fecha_retiro && (
              <div>
                <span className="font-medium text-gray-600">Fecha de Retiro:</span>
                <p className="font-semibold text-gray-800">{formatDate(employeeData.fecha_retiro)}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">Tipo de Contrato:</span>
              <p className="font-semibold text-gray-800">{employeeData.tipo_contrato}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Selecciona tu Certificado
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Elige el tipo de certificación que necesitas
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {certificateTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => onGenerateCertificate(type.id)}
                  disabled={!type.available}
                  className={`p-6 h-auto text-left justify-start hover:scale-105 transition-all duration-200 ${
                    type.available 
                      ? 'bg-gradient-to-r from-vity-green to-vity-green-light hover:from-vity-green-dark hover:to-vity-green text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100'
                  }`}
                  variant={type.available ? "default" : "secondary"}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className={`p-3 rounded-full ${type.available ? 'bg-white/20' : 'bg-gray-300'}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{type.title}</h3>
                      <p className={`text-sm ${type.available ? 'text-white/90' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                      {!type.available && (
                        <Badge variant="secondary" className="mt-2 bg-gray-200 text-gray-600">
                          No disponible
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full mt-6 h-12 border-vity-green text-vity-green hover:bg-vity-green/10"
          >
            Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateOptions;
