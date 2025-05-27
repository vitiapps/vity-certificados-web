
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Database, Download, History } from 'lucide-react';
import ExcelUploader from './ExcelUploader';
import ExcelDownloader from './ExcelDownloader';
import EmployeeList from './EmployeeList';
import CertificateHistory from './CertificateHistory';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'download' | 'employees' | 'history'>('upload');
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green p-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
              Panel de Administrador
            </CardTitle>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Gestiona la información de empleados
            </p>
          </CardHeader>
          
          <div className="flex justify-center mb-6 px-4">
            <div className="flex flex-col sm:flex-row bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={activeTab === 'download' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('download')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Descargar Base</span>
                <span className="sm:hidden">Descargar</span>
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('upload')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Cargar Excel</span>
                <span className="sm:hidden">Cargar</span>
              </Button>
              <Button
                variant={activeTab === 'employees' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('employees')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm"
              >
                <Database size={16} />
                <span className="hidden sm:inline">Ver Empleados</span>
                <span className="sm:hidden">Empleados</span>
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('history')}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <History size={16} />
                <span className="hidden sm:inline">Historial</span>
                <span className="sm:hidden">Historial</span>
              </Button>
            </div>
          </div>

          <CardContent className="px-4 md:px-6">
            {activeTab === 'download' && <ExcelDownloader />}
            {activeTab === 'upload' && <ExcelUploader />}
            {activeTab === 'employees' && <EmployeeList />}
            {activeTab === 'history' && <CertificateHistory />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
