import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Plus, Trash2, X } from 'lucide-react';

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
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyConfigs();
  }, []);

  useEffect(() => {
    setLogoPreview(currentConfig.logoUrl || '');
  }, [currentConfig.logoUrl]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setCurrentConfig(prev => ({ ...prev, logoUrl: result }));
        toast({
          title: "Logo cargado",
          description: "El logo se ha cargado correctamente"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setCurrentConfig(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    setLogoPreview('');
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
                <Label>Logo de la Empresa</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Cargar Logo
                    </Button>
                    {logoPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeLogo}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  
                  {logoPreview && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-20 w-auto border rounded"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Formatos admitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>
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
