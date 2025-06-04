
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
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center justify-center gap-2">
            <Database className="h-6 w-6 text-vity-green" />
            Gestión de Base de Empleados
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Flujo recomendado:</strong> 
              Descarga → Modifica → Carga
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="download" 
                className="flex items-center gap-2 data-[state=active]:bg-vity-green data-[state=active]:text-white"
              >
                <Download className="h-4 w-4" />
                Descargar
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="flex items-center gap-2 data-[state=active]:bg-vity-green data-[state=active]:text-white"
              >
                <Upload className="h-4 w-4" />
                Cargar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="download" className="space-y-4">
              <ExcelDownloader />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <ExcelUploader />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDataManager;
