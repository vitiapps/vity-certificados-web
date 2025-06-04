
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, AlertCircle, Database, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';

interface GoogleSheetsSetupProps {
  onSetupComplete?: () => void;
}

const GoogleSheetsSetup: React.FC<GoogleSheetsSetupProps> = ({ onSetupComplete }) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreatingData, setIsCreatingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cargar credenciales guardadas al montar el componente
    const isConfigured = googleSheetsService.loadCredentials();
    if (isConfigured) {
      setIsConnected(true);
    }
  }, []);

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
      // Configurar las credenciales en el servicio
      googleSheetsService.setCredentials(spreadsheetId.trim(), apiKey.trim());
      
      // Probar la conexión
      const connectionSuccess = await googleSheetsService.testConnection();
      
      if (connectionSuccess) {
        setIsConnected(true);
        toast({
          title: "¡Conectado exitosamente!",
          description: "Google Sheets está configurado correctamente",
        });
        
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        throw new Error('Conexión fallida');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Google Sheets. Verifica que el ID de la hoja y la API key sean correctos, y que la hoja tenga las pestañas 'Empleados' e 'Historial'.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsCreatingData(true);
    
    try {
      await googleSheetsService.createSampleData();
      toast({
        title: "¡Datos de ejemplo creados!",
        description: "Se han agregado datos de ejemplo a tu hoja de cálculo",
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Error",
        description: "No se pudieron crear los datos de ejemplo. Verifica que tengas permisos de escritura en la hoja.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingData(false);
    }
  };

  const copySheetTemplate = () => {
    const templateUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy';
    window.open(templateUrl, '_blank');
  };

  if (isConnected) {
    return (
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Google Sheets conectado exitosamente</span>
            </div>
            
            <Button 
              onClick={handleCreateSampleData}
              disabled={isCreatingData}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Database className="h-4 w-4 mr-2" />
              {isCreatingData ? 'Creando datos...' : 'Agregar Datos de Ejemplo'}
            </Button>
            
            <p className="text-sm text-gray-600">
              Los datos de ejemplo incluyen 3 empleados de prueba que puedes usar para probar la aplicación.
            </p>
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
              <strong>Paso 1:</strong> Crea una copia de nuestra plantilla de Google Sheets haciendo clic en el botón de abajo.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={copySheetTemplate}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Crear Copia de la Plantilla
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Paso 2:</strong> Obtén una clave API de Google Sheets desde Google Cloud Console.
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
                Puedes encontrar el ID en la URL de tu hoja de cálculo entre "/d/" y "/edit"
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
                href="https://console.cloud.google.com/apis/library/sheets.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Habilitar Google Sheets API</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800">
            Instrucciones Detalladas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-700">1. Crear la hoja de cálculo:</h4>
              <p className="text-sm text-gray-600">
                Haz clic en "Crear Copia de la Plantilla" arriba. Esto creará una nueva hoja con las pestañas y columnas correctas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">2. Obtener clave API:</h4>
              <p className="text-sm text-gray-600">
                Ve a Google Cloud Console, crea un proyecto, habilita la API de Google Sheets y crea una clave API.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">3. Configurar permisos:</h4>
              <p className="text-sm text-gray-600">
                Asegúrate de que tu hoja de cálculo sea pública o que la clave API tenga permisos para accederla.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsSetup;
