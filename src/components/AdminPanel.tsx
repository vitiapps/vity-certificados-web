
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, FileSpreadsheet, Download, Settings, History, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import EmployeeList from './EmployeeList';
import ExcelUploader from './ExcelUploader';
import ExcelDownloader from './ExcelDownloader';
import CertificateHistory from './CertificateHistory';
import GoogleSheetsSetup from './GoogleSheetsSetup';
import CreateEmployeeDialog from './CreateEmployeeDialog';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-white/80">Gestiona empleados, configuraciones y certificaciones</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-vity-green flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración de Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Aquí puedes configurar los parámetros de los certificados laborales, 
                      incluyendo logos, firmas y textos personalizados.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Configuraciones disponibles:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Logo de la empresa</li>
                        <li>• Datos de la empresa (NIT, dirección)</li>
                        <li>• Configuración de firmas</li>
                        <li>• Colores y estilos del certificado</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
