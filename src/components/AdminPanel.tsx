
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileSpreadsheet, Download, Settings, History } from 'lucide-react';
import EmployeeList from './EmployeeList';
import ExcelUploader from './ExcelUploader';
import ExcelDownloader from './ExcelDownloader';
import CertificateHistory from './CertificateHistory';
import GoogleSheetsSetup from './GoogleSheetsSetup';
import CreateEmployeeDialog from './CreateEmployeeDialog';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-white/80">Gestiona empleados, configuraciones y certificaciones</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Carga Masiva
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Descargar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-vity-green">Lista de Empleados</CardTitle>
                  <CreateEmployeeDialog />
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-vity-green flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Carga Masiva de Empleados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExcelUploader />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-vity-green flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Descargar Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExcelDownloader />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-vity-green flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CertificateHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-vity-green flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Google Sheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GoogleSheetsSetup />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
