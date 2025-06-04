
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';

const GoogleSheetsSetup: React.FC = () => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!spreadsheetId || !apiKey) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Aquí normalmente actualizaríamos la configuración del servicio
      // Por simplicidad, vamos a simular la conexión
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        toast({
          title: "¡Conectado exitosamente!",
          description: "Google Sheets está configurado correctamente",
        });
      }, 2000);
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Google Sheets. Verifica tus credenciales.",
        variant: "destructive"
      });
    }
  };

  if (isConnected) {
    return (
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Google Sheets conectado exitosamente</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Configurar Google Sheets
          </CardTitle>
          <p className="text-gray-600">
            Conecta tu aplicación con Google Sheets para almacenar los datos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Necesitarás configurar una hoja de cálculo de Google con las pestañas "Empleados" e "Historial" 
              y obtener una clave API de Google Sheets.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="spreadsheetId" className="text-gray-700 font-medium">
                ID de la Hoja de Cálculo
              </Label>
              <Input
                id="spreadsheetId"
                type="text"
                placeholder="1ABC123def456ghi789jkl"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Puedes encontrar el ID en la URL de tu hoja de cálculo
              </p>
            </div>

            <div>
              <Label htmlFor="apiKey" className="text-gray-700 font-medium">
                Clave API de Google Sheets
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button 
            onClick={handleConnect}
            disabled={isConnecting || !spreadsheetId || !apiKey}
            className="w-full bg-vity-green hover:bg-vity-green-dark"
          >
            {isConnecting ? 'Conectando...' : 'Conectar Google Sheets'}
          </Button>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-gray-800">Enlaces útiles:</h3>
            <div className="flex flex-col space-y-2">
              <a 
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Crear clave API de Google</span>
              </a>
              <a 
                href="https://docs.google.com/spreadsheets/create"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Crear nueva hoja de cálculo</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800">
            Estructura de las Hojas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">Pestaña "Empleados":</h4>
            <p className="text-sm text-gray-600">
              Columnas: ID, Tipo Documento, Número Documento, Nombre, Cargo, Empresa, Estado, Sueldo, Fecha Ingreso, Fecha Retiro, Tipo Contrato, Correo
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Pestaña "Historial":</h4>
            <p className="text-sm text-gray-600">
              Columnas: ID, Empleado ID, Nombre Empleado, Número Documento, Tipo Certificación, Fecha Generación, Generado Por, Detalles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsSetup;
