
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, AlertCircle, Database, Copy, FileText } from 'lucide-react';
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
  const [showInstructions, setShowInstructions] = useState(false);
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

  const handleShowInstructions = () => {
    setShowInstructions(!showInstructions);
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
              onClick={handleShowInstructions}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showInstructions ? 'Ocultar Instrucciones' : 'Ver Instrucciones para Agregar Datos'}
            </Button>
            
            {showInstructions && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">Datos que debes agregar manualmente a tu hoja:</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700">Pestaña "Empleados" - Headers (Fila 1):</h4>
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border font-mono">
                      ID | Tipo Documento | Número Documento | Nombre | Cargo | Empresa | Estado | Sueldo | Fecha Ingreso | Fecha Retiro | Tipo Contrato | Correo
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Empleados de ejemplo (agrega en las filas 2-6):</h4>
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border font-mono space-y-1">
                      <div>1 | CC | 1024532077 | Juan Pérez García | Desarrollador Senior | VITY | ACTIVO | 4500000 | 2023-01-15 | | INDEFINIDO | juan.perez@vity.com</div>
                      <div>2 | CC | 1098765432 | María López Rodríguez | Analista de Recursos Humanos | VITY | ACTIVO | 3200000 | 2023-03-20 | | INDEFINIDO | maria.lopez@vity.com</div>
                      <div>3 | CC | 1122334455 | Carlos Martínez Silva | Gerente de Proyectos | VITY | RETIRADO | 5500000 | 2022-06-10 | 2024-10-30 | INDEFINIDO | carlos.martinez@vity.com</div>
                      <div>4 | CC | 1234567890 | Ana Rodríguez Torres | Diseñadora UX/UI | VITY | ACTIVO | 3800000 | 2023-05-12 | | INDEFINIDO | ana.rodriguez@vity.com</div>
                      <div>5 | CC | 9876543210 | Luis Gómez Vargas | Contador Senior | VITY | ACTIVO | 4200000 | 2022-09-01 | | INDEFINIDO | luis.gomez@vity.com</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Pestaña "Historial" - Headers (Fila 1):</h4>
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border font-mono">
                      ID | Empleado ID | Nombre Empleado | Número Documento | Tipo Certificación | Fecha Generación | Generado Por | Detalles
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Copia estos datos exactamente como se muestran, separando cada campo en una columna diferente. Una vez agregados, podrás probar la aplicación con las cédulas: 1024532077, 1098765432, 1122334455, 1234567890, 9876543210
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              Como la API key actual es de solo lectura, debes agregar los datos manualmente a tu hoja de Google Sheets.
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
