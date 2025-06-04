
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Database, History, LogOut, UserPlus, Users, Settings } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import EmployeeDataManager from './EmployeeDataManager';
import EmployeeList from './EmployeeList';
import CertificateHistory from './CertificateHistory';
import CreateAdminForm from './CreateAdminForm';
import CertificateCustomization from './CertificateCustomization';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'data-manager' | 'employees' | 'history' | 'create-admin' | 'certificate-config'>('data-manager');
  const { admin, logout } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    logout();
    // La redirección ahora se maneja en el contexto
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vity-green via-vity-green-light to-vity-green p-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                  Panel de Administrador
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                  Gestiona la información de empleados y certificaciones
                </p>
                {admin && (
                  <p className="text-sm text-gray-500 mt-1">
                    Bienvenido, {admin.name} ({admin.role === 'super_admin' ? 'Super Administrador' : 'Administrador'})
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </Button>
            </div>
          </CardHeader>
          
          <div className="flex justify-center mb-6 px-4">
            <div className="flex flex-col sm:flex-row bg-gray-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
              <Button
                variant={activeTab === 'data-manager' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('data-manager')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm whitespace-nowrap"
              >
                <Database size={16} />
                <span className="hidden sm:inline">Gestión de Datos</span>
                <span className="sm:hidden">Datos</span>
              </Button>
              <Button
                variant={activeTab === 'employees' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('employees')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm whitespace-nowrap"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Ver Empleados</span>
                <span className="sm:hidden">Empleados</span>
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('history')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm whitespace-nowrap"
              >
                <History size={16} />
                <span className="hidden sm:inline">Historial</span>
                <span className="sm:hidden">Historial</span>
              </Button>
              <Button
                variant={activeTab === 'certificate-config' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('certificate-config')}
                className="flex items-center justify-center gap-2 mb-1 sm:mb-0 text-xs sm:text-sm whitespace-nowrap"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Certificados</span>
                <span className="sm:hidden">Config</span>
              </Button>
              {admin?.role === 'super_admin' && (
                <Button
                  variant={activeTab === 'create-admin' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('create-admin')}
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">Crear Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              )}
            </div>
          </div>

          <CardContent className="px-4 md:px-6">
            {activeTab === 'data-manager' && <EmployeeDataManager />}
            {activeTab === 'employees' && <EmployeeList />}
            {activeTab === 'history' && <CertificateHistory />}
            {activeTab === 'certificate-config' && <CertificateCustomization />}
            {activeTab === 'create-admin' && <CreateAdminForm />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
