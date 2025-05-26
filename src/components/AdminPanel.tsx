
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Database } from 'lucide-react';
import ExcelUploader from './ExcelUploader';
import EmployeeList from './EmployeeList';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'employees'>('upload');
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green p-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Panel de Administrador
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Gestiona la información de empleados
            </p>
          </CardHeader>
          
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === 'upload' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('upload')}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Cargar Excel
              </Button>
              <Button
                variant={activeTab === 'employees' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('employees')}
                className="flex items-center gap-2"
              >
                <Database size={16} />
                Ver Empleados
              </Button>
            </div>
          </div>

          <CardContent>
            {activeTab === 'upload' && <ExcelUploader />}
            {activeTab === 'employees' && <EmployeeList />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
