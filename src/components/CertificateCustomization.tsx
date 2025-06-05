
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Plus, Trash2, X, RefreshCw } from 'lucide-react';
import { companyConfigService, CompanyCertificateConfig } from '@/services/companyConfigService';

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
  const [isNewCompany, setIsNewCompany] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyConfigs();
  }, []);

  useEffect(() => {
    setLogoPreview(currentConfig.logoUrl || '');
  }, [currentConfig.logoUrl]);

  const loadCompanyConfigs = async () => {
    setIsLoading(true);
    try {
      // Primero intentar migrar datos de localStorage si existen
      await companyConfigService.migrateFromLocalStorage();
      
      // Cargar configuraciones desde la base de datos
      const configs = await companyConfigService.getAllConfigs();
      setCompanies(configs);
      
      // Si no hay configuraciones, crear la de Best People por defecto
      if (configs.length === 0) {
        await createDefaultBestPeopleConfig();
      }
    } catch (error) {
      console.error('Error loading company configs:', error);
      toast({
        title: "Error",
        description: "Error al cargar las configuraciones de empresas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultBestPeopleConfig = async () => {
    try {
      const bestPeopleConfig: Omit<CompanyCertificateConfig, 'id'> = {
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
      
      const created = await companyConfigService.createConfig(bestPeopleConfig);
      setCompanies([created]);
      
      toast({
        title: "Configuración creada",
        description: "Se ha creado la configuración por defecto de Best People"
      });
    } catch (error) {
      console.error('Error creating default config:', error);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    if (companyId === '') {
      createNewCompany();
      return;
    }
    
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentConfig(company);
      setSelectedCompany(companyId);
      setIsNewCompany(false);
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

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>, signatoryIndex: number) => {
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
        setCurrentConfig(prev => ({
          ...prev,
          signatories: prev.signatories.map((sig, i) => 
            i === signatoryIndex ? { ...sig, signature: result } : sig
          )
        }));
        toast({
          title: "Firma cargada",
          description: "La firma se ha cargado correctamente"
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

  const removeSignature = (signatoryIndex: number) => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) => 
        i === signatoryIndex ? { ...sig, signature: '' } : sig
      )
    }));
    if (signatureInputRefs.current[signatoryIndex]) {
      signatureInputRefs.current[signatoryIndex]!.value = '';
    }
  };

  const addSignatory = () => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: [...prev.signatories, { name: '', position: '' }]
    }));
  };

  const removeSignatory = (index: number) => {
    if (currentConfig.signatories.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un firmante",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentConfig(prev => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index)
    }));
    signatureInputRefs.current = signatureInputRefs.current.filter((_, i) => i !== index);
  };

  const updateSignatory = (index: number, field: 'name' | 'position', value: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) => 
        i === index ? { ...sig, [field]: value } : sig
      )
    }));
  };

  const saveConfiguration = async () => {
    if (!currentConfig.companyName || !currentConfig.nit) {
      toast({
        title: "Error",
        description: "Nombre de empresa y NIT son requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let savedConfig: CompanyCertificateConfig;
      
      if (isNewCompany || !selectedCompany) {
        // Nueva empresa
        const { id, ...configData } = currentConfig;
        savedConfig = await companyConfigService.createConfig(configData);
        setSelectedCompany(savedConfig.id);
        setIsNewCompany(false);
      } else {
        // Actualizar empresa existente
        const { id, ...configData } = currentConfig;
        savedConfig = await companyConfigService.updateConfig(selectedCompany, configData);
      }

      // Actualizar la lista local
      await loadCompanyConfigs();
      setCurrentConfig(savedConfig);
      
      toast({
        title: "Configuración guardada",
        description: "La personalización del certificado se ha guardado correctamente"
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCompany = () => {
    const newConfig: CompanyCertificateConfig = {
      id: '',
      companyName: '',
      nit: '',
      city: '',
      signatories: [{ name: '', position: '' }],
      headerColor: '#22c55e'
    };
    
    setCurrentConfig(newConfig);
    setSelectedCompany('');
    setLogoPreview('');
    setIsNewCompany(true);
    
    // Limpiar referencias de archivos
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    signatureInputRefs.current = [];
  };

  const deleteCompany = async () => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Selecciona una empresa para eliminar",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      return;
    }

    setIsLoading(true);
    try {
      await companyConfigService.deleteConfig(selectedCompany);
      await loadCompanyConfigs();
      createNewCompany();
      
      toast({
        title: "Empresa eliminada",
        description: "La configuración de la empresa se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la empresa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
              >
                <option value="">Nueva empresa...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <Button 
                onClick={loadCompanyConfigs} 
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="mt-6"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button onClick={createNewCompany} className="mt-6" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Empresa
              </Button>
              {selectedCompany && !isNewCompany && (
                <Button 
                  onClick={deleteCompany} 
                  variant="destructive"
                  className="mt-6"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vity-green mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={currentConfig.companyName}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="BEST PEOPLE"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  value={currentConfig.nit}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, nit: e.target.value }))}
                  placeholder="NIT 900493317-2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={currentConfig.city}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Bogotá, Colombia"
                  disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                  disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <Input
                        placeholder="Cargo"
                        value={signatory.position}
                        onChange={(e) => updateSignatory(index, 'position', e.target.value)}
                        disabled={isLoading}
                      />
                      
                      {/* Sección de firma */}
                      <div className="space-y-2">
                        <Label className="text-sm">Firma</Label>
                        <div className="flex items-center gap-2">
                          <input
                            ref={(el) => signatureInputRefs.current[index] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSignatureUpload(e, index)}
                            className="hidden"
                            id={`signature-upload-${index}`}
                            disabled={isLoading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => signatureInputRefs.current[index]?.click()}
                            className="flex items-center gap-1"
                            disabled={isLoading}
                          >
                            <Upload size={14} />
                            Cargar Firma
                          </Button>
                          {signatory.signature && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSignature(index)}
                              className="text-red-600 hover:bg-red-50"
                              disabled={isLoading}
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                        
                        {signatory.signature && (
                          <div className="border rounded p-2 bg-gray-50">
                            <p className="text-xs text-gray-600 mb-1">Vista previa:</p>
                            <img
                              src={signatory.signature}
                              alt="Signature preview"
                              className="max-h-12 w-auto border rounded"
                            />
                          </div>
                        )}
                      </div>

                      {currentConfig.signatories.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSignatory(index)}
                          className="text-red-600"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={addSignatory}
                  disabled={isLoading}
                >
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
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={saveConfiguration} 
              className="bg-vity-green hover:bg-vity-green-dark"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : (isNewCompany || !selectedCompany ? 'Crear Empresa' : 'Actualizar Configuración')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateCustomization;
