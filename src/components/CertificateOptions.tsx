
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ArrowLeft, Sparkles } from 'lucide-react';

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

  const certificateTypes = [
    {
      id: 'empleado-activo',
      title: 'Empleado Activo ✅',
      description: 'Certificado de vinculación laboral actual',
      icon: User,
      gradient: 'from-green-400 to-emerald-500',
      available: employeeData.estado === 'ACTIVO'
    },
    {
      id: 'empleado-retirado',
      title: 'Empleado Retirado 📅',
      description: 'Certificado de desvinculación laboral',
      icon: Calendar,
      gradient: 'from-blue-400 to-blue-500',
      available: employeeData.estado === 'RETIRADO'
    },
    {
      id: 'historial-completo',
      title: 'Historial Completo 📋',
      description: 'Certificado con toda la información laboral',
      icon: FileText,
      gradient: 'from-purple-400 to-pink-500',
      available: true
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-6">
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Información del Empleado 👤
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
              <span className="text-sm font-medium text-blue-600">👤 Nombre:</span>
              <p className="font-bold text-blue-900 text-lg">{employeeData.nombre}</p>
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
              <span className="text-sm font-medium text-red-600">📊 Estado:</span>
              <Badge 
                className={`mt-2 ${employeeData.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-500'} text-white font-bold`}
              >
                {employeeData.estado}
              </Badge>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-2xl">
              <span className="text-sm font-medium text-teal-600">💰 Salario:</span>
              <p className="font-bold text-teal-900">{formatCurrency(employeeData.sueldo)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-red-500 text-white pb-6">
          <CardTitle className="text-2xl font-bold text-center">
            🎯 Selecciona tu Certificado
          </CardTitle>
          <p className="text-center text-white/90 mt-2">
            Elige el tipo de certificación que necesitas
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6">
            {certificateTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => onGenerateCertificate(type.id)}
                  disabled={!type.available}
                  className={`p-6 h-auto text-left justify-start rounded-2xl transition-all duration-300 ${
                    type.available 
                      ? `bg-gradient-to-r ${type.gradient} hover:scale-105 text-white shadow-lg transform` 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  variant="ghost"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className={`p-4 rounded-2xl ${type.available ? 'bg-white/20' : 'bg-gray-300'}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl">{type.title}</h3>
                      <p className={`text-sm mt-1 ${type.available ? 'text-white/90' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                      {!type.available && (
                        <Badge variant="secondary" className="mt-2 bg-red-200 text-red-700 font-bold">
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
            className="w-full mt-6 h-14 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl font-bold text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            🔙 Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateOptions;
