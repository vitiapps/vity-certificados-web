
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';

interface CompanyCertificateConfig {
  id: string;
  companyName: string;
  logoUrl?: string;
  nit: string;
  city: string;
  signatories: {
    name: string;
    position: string;
    signature?: string;
  }[];
  customText?: string;
  headerColor: string;
  footerText?: string;
}

const CertificateCustomization: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyCertificateConfig[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [currentConfig, setCurrentConfig] = useState<CompanyCertificateConfig>({
    id: '',
    companyName: '',
    nit: '',
    city: '',
    signatories: [{ name: '', position: '' }],
    headerColor: '#22c55e'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyConfigs();
  }, []);

  const loadCompanyConfigs = () => {
    const saved = localStorage.getItem('certificate_company_configs');
    if (saved) {
      const configs = JSON.parse(saved);
      setCompanies(configs);
      
      // Agregar configuración por defecto para Best People si no existe
      const bestPeopleExists = configs.some((c: CompanyCertificateConfig) => 
        c.companyName.toLowerCase().includes('best people')
      );
      
      if (!bestPeopleExists) {
        const bestPeopleConfig: CompanyCertificateConfig = {
          id: 'best-people',
          companyName: 'BEST PEOPLE',
          logoUrl: '/lovable-uploads/978900f6-22c7-42ed-bf44-a140b1685e00.png',
          nit: 'NIT 900493317-2',
          city: 'Bogotá, Colombia',
          signatories: [
            {
              name: 'CECILIA SALCEDO D.',
              position: 'Directora de Gestión Humana'
            }
          ],
          headerColor: '#22c55e',
          footerText: 'Cra 14 # 93-44/46 Torre B. Of. 501\nTel. 315556673\nBogotá - Colombia'
        };
        
        const updatedConfigs = [...configs, bestPeopleConfig];
        setCompanies(updatedConfigs);
        localStorage.setItem('certificate_company_configs', JSON.stringify(updatedConfigs));
      }
    } else {
      // Crear configuración inicial para Best People
      const initialConfig: CompanyCertificateConfig = {
        id: 'best-people',
        companyName: 'BEST PEOPLE',
        logoUrl: '/lovable-uploads/978900f6-22c7-42ed-bf44-a140b1685e00.png',
        nit: 'NIT 900493317-2',
        city: 'Bogotá, Colombia',
        signatories: [
          {
            name: 'CECILIA SALCEDO D.',
            position: 'Directora de Gestión Humana'
          }
        ],
        headerColor: '#22c55e',
        footerText: 'Cra 14 # 93-44/46 Torre B. Of. 501\nTel. 315556673\nBogotá - Colombia'
      };
      
      setCompanies([initialConfig]);
      localStorage.setItem('certificate_company_configs', JSON.stringify([initialConfig]));
    }
  };

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentConfig(company);
      setSelectedCompany(companyId);
    }
  };

  const addSignatory = () => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: [...prev.signatories, { name: '', position: '' }]
    }));
  };

  const removeSignatory = (index: number) => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index)
    }));
  };

  const updateSignatory = (index: number, field: 'name' | 'position', value: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) => 
        i === index ? { ...sig, [field]: value } : sig
      )
    }));
  };

  const saveConfiguration = () => {
    if (!currentConfig.companyName || !currentConfig.nit) {
      toast({
        title: "Error",
        description: "Nombre de empresa y NIT son requeridos",
        variant: "destructive"
      });
      return;
    }

    const updatedCompanies = selectedCompany
      ? companies.map(c => c.id === selectedCompany ? currentConfig : c)
      : [...companies, { ...currentConfig, id: Date.now().toString() }];

    setCompanies(updatedCompanies);
    localStorage.setItem('certificate_company_configs', JSON.stringify(updatedCompanies));
    
    toast({
      title: "Configuración guardada",
      description: "La personalización del certificado se ha guardado correctamente"
    });
  };

  const createNewCompany = () => {
    setCurrentConfig({
      id: '',
      companyName: '',
      nit: '',
      city: '',
      signatories: [{ name: '', position: '' }],
      headerColor: '#22c55e'
    });
    setSelectedCompany('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Personalización de Certificados por Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label>Seleccionar Empresa</Label>
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanySelect(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={createNewCompany} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Empresa
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={currentConfig.companyName}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="BEST PEOPLE"
                />
              </div>

              <div>
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  value={currentConfig.nit}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, nit: e.target.value }))}
                  placeholder="NIT 900493317-2"
                />
              </div>

              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={currentConfig.city}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Bogotá, Colombia"
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <Input
                  id="logoUrl"
                  value={currentConfig.logoUrl || ''}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="/path/to/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="headerColor">Color del Encabezado</Label>
                <Input
                  id="headerColor"
                  type="color"
                  value={currentConfig.headerColor}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, headerColor: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Firmantes</Label>
                {currentConfig.signatories.map((signatory, index) => (
                  <div key={index} className="border p-4 rounded-md mb-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Nombre del firmante"
                        value={signatory.name}
                        onChange={(e) => updateSignatory(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Cargo"
                        value={signatory.position}
                        onChange={(e) => updateSignatory(index, 'position', e.target.value)}
                      />
                      {currentConfig.signatories.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSignatory(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addSignatory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Firmante
                </Button>
              </div>

              <div>
                <Label htmlFor="footerText">Texto del Pie de Página</Label>
                <Textarea
                  id="footerText"
                  value={currentConfig.footerText || ''}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, footerText: e.target.value }))}
                  placeholder="Dirección, teléfono, ciudad..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={saveConfiguration} className="bg-vity-green hover:bg-vity-green-dark">
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateCustomization;
