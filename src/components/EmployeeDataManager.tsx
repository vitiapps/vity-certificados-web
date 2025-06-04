
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Database, Info } from 'lucide-react';
import ExcelUploader from './ExcelUploader';
import ExcelDownloader from './ExcelDownloader';

const EmployeeDataManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('download');

  return (
    <div className="space-y-6">
      <Card className="border-2 border-vity-green/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center justify-center gap-2">
            <Database className="h-6 w-6 text-vity-green" />
            Gestión de Base de Empleados
          </CardTitle>
          <p className="text-gray-600 text-sm md:text-base">
            Descarga, modifica y carga información de empleados de manera eficiente
          </p>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Flujo recomendado:</strong> 
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. <strong>Descarga</strong> la base actual de empleados</li>
                <li>2. <strong>Modifica</strong> los datos en Excel (actualizar existentes o agregar nuevos)</li>
                <li>3. <strong>Carga</strong> el archivo modificado para sincronizar los cambios</li>
              </ol>
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="download" 
                className="flex items-center gap-2 data-[state=active]:bg-vity-green data-[state=active]:text-white"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar Base</span>
                <span className="sm:hidden">Descargar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="flex items-center gap-2 data-[state=active]:bg-vity-green data-[state=active]:text-white"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Cargar Cambios</span>
                <span className="sm:hidden">Cargar</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="download" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Descargar Base de Empleados
                </h3>
                <div className="space-y-3">
                  <p className="text-green-700 text-sm">
                    Obtén un archivo Excel completo con toda la información actual de empleados
                  </p>
                  
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">El archivo incluye:</h4>
                    <ul className="text-green-600 text-sm space-y-1">
                      <li>📊 <strong>Hoja "Empleados Actuales":</strong> Todos los empleados registrados</li>
                      <li>📝 <strong>Hoja "Plantilla Nuevos":</strong> Formato para agregar empleados</li>
                      <li>✏️ <strong>Modificaciones:</strong> Edita datos existentes directamente</li>
                      <li>➕ <strong>Nuevos registros:</strong> Usa la plantilla para agregar empleados</li>
                    </ul>
                  </div>
                </div>
              </div>
              <ExcelDownloader />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Cargar Actualizaciones
                </h3>
                <div className="space-y-3">
                  <p className="text-blue-700 text-sm">
                    Sube tu archivo Excel modificado para sincronizar los cambios con la base de datos
                  </p>
                  
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Tipos de actualizaciones:</h4>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>🔄 <strong>Actualizar:</strong> Modifica empleados existentes (por número de documento)</li>
                      <li>➕ <strong>Agregar:</strong> Nuevos empleados con documentos únicos</li>
                      <li>📋 <strong>Procesamiento:</strong> Solo se aplican los cambios detectados</li>
                      <li>⚡ <strong>Eficiente:</strong> Carga por lotes para mejor rendimiento</li>
                    </ul>
                  </div>
                </div>
              </div>
              <ExcelUploader />
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Consejos de uso:</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Siempre descarga la base actual antes de hacer modificaciones</li>
              <li>• Los empleados se identifican por número de documento (columna clave)</li>
              <li>• Puedes usar cualquiera de las dos hojas del archivo descargado</li>
              <li>• Los cambios se procesan de forma segura sin duplicar información</li>
              <li>• Se recomienda hacer respaldos antes de cargas masivas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDataManager;
