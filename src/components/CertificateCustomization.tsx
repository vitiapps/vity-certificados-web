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
  const [isNewCompany, setIsNewCompany] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanyConfigs();
  }, []);

  const loadCompanyConfigs = () => {
    console.log('Cargando configuraciones de empresas...');
    
    try {
      const saved = localStorage.getItem('certificate_company_configs');
      console.log('Datos guardados en localStorage:', saved);
      
      if (saved) {
        const configs = JSON.parse(saved);
        console.log('Configuraciones parseadas:', configs);
        console.log('Número de empresas encontradas:', configs.length);
        
        // Log detallado de cada empresa
        configs.forEach((config: CompanyCertificateConfig, index: number) => {
          console.log(`Empresa ${index + 1}:`, {
            id: config.id,
            nombre: config.companyName,
            tieneLogoUrl: !!config.logoUrl,
            logoType: config.logoUrl?.startsWith('data:') ? 'base64' : 'url',
            logoSize: config.logoUrl ? config.logoUrl.length : 0,
            firmantes: config.signatories.length,
            firmantesWith: config.signatories.filter(s => s.signature).length
          });
        });
        
        setCompanies(configs);
        
        // Agregar configuración por defecto para Best People si no existe
        const bestPeopleExists = configs.some((c: CompanyCertificateConfig) => 
          c.companyName.toLowerCase().includes('best people')
        );
        
        if (!bestPeopleExists) {
          console.log('Agregando configuración por defecto de Best People...');
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
          console.log('Configuración de Best People agregada');
        }
      } else {
        console.log('No hay datos guardados, creando configuración inicial...');
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
        console.log('Configuración inicial creada');
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      toast({
        title: "Error",
        description: "Error al cargar las configuraciones de empresas",
        variant: "destructive"
      });
    }
  };

  const handleCompanySelect = (companyId: string) => {
    console.log('Seleccionando empresa:', companyId);
    
    if (companyId === '') {
      createNewCompany();
      return;
    }
    
    const company = companies.find(c => c.id === companyId);
    if (company) {
      console.log('Empresa encontrada:', {
        nombre: company.companyName,
        tieneLogoUrl: !!company.logoUrl,
        logoType: company.logoUrl?.startsWith('data:') ? 'base64' : 'url',
        firmantes: company.signatories.length
      });
      
      setCurrentConfig(company);
      setSelectedCompany(companyId);
      setIsNewCompany(false);
    } else {
      console.error('Empresa no encontrada con ID:', companyId);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log('Imagen convertida a base64, tamaño:', result.length);
        resolve(result);
      };
      reader.onerror = () => {
        console.error('Error al convertir imagen a base64');
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Subiendo archivo de logo:', {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size
      });
      
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

      try {
        const base64Result = await convertImageToBase64(file);
        setCurrentConfig(prev => ({ ...prev, logoUrl: base64Result }));
        console.log('Logo cargado exitosamente, tamaño base64:', base64Result.length);
        toast({
          title: "Logo cargado",
          description: "El logo se ha cargado correctamente"
        });
      } catch (error) {
        console.error('Error al cargar el logo:', error);
        toast({
          title: "Error",
          description: "Error al cargar el logo. Intenta nuevamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>, signatoryIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Subiendo firma para firmante', signatoryIndex, ':', {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size
      });
      
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

      try {
        const base64Result = await convertImageToBase64(file);
        setCurrentConfig(prev => ({
          ...prev,
          signatories: prev.signatories.map((sig, i) => 
            i === signatoryIndex ? { ...sig, signature: base64Result } : sig
          )
        }));
        console.log('Firma cargada exitosamente para firmante', signatoryIndex, ', tamaño base64:', base64Result.length);
        toast({
          title: "Firma cargada",
          description: "La firma se ha cargado correctamente"
        });
      } catch (error) {
        console.error('Error al cargar la firma:', error);
        toast({
          title: "Error",
          description: "Error al cargar la firma. Intenta nuevamente.",
          variant: "destructive"
        });
      }
    }
  };

  const removeLogo = () => {
    setCurrentConfig(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Logo eliminado",
      description: "El logo se ha eliminado correctamente"
    });
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
    toast({
      title: "Firma eliminada",
      description: "La firma se ha eliminado correctamente"
    });
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

  const saveConfiguration = () => {
    console.log('Guardando configuración:', {
      id: currentConfig.id,
      nombre: currentConfig.companyName,
      tieneLogoUrl: !!currentConfig.logoUrl,
      logoSize: currentConfig.logoUrl ? currentConfig.logoUrl.length : 0,
      firmantes: currentConfig.signatories.length,
      firmantesWith: currentConfig.signatories.filter(s => s.signature).length
    });
    
    if (!currentConfig.companyName || !currentConfig.nit) {
      toast({
        title: "Error",
        description: "Nombre de empresa y NIT son requeridos",
        variant: "destructive"
      });
      return;
    }

    const configToSave = {
      ...currentConfig,
      id: currentConfig.id || `company-${Date.now()}`
    };

    let updatedCompanies;
    if (isNewCompany || !selectedCompany) {
      updatedCompanies = [...companies, configToSave];
      setSelectedCompany(configToSave.id);
      setIsNewCompany(false);
      console.log('Nueva empresa agregada');
    } else {
      updatedCompanies = companies.map(c => c.id === selectedCompany ? configToSave : c);
      console.log('Empresa actualizada');
    }

    setCompanies(updatedCompanies);
    setCurrentConfig(configToSave);
    
    try {
      localStorage.setItem('certificate_company_configs', JSON.stringify(updatedCompanies));
      console.log('Configuración guardada en localStorage exitosamente');
      
      // Verificar que se guardó correctamente
      const verificacion = localStorage.getItem('certificate_company_configs');
      if (verificacion) {
        const parsed = JSON.parse(verificacion);
        console.log('Verificación: empresas guardadas:', parsed.length);
      }
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Configuración guardada",
      description: "La personalización del certificado se ha guardado correctamente"
    });
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
    setIsNewCompany(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    signatureInputRefs.current = [];
  };

  const deleteCompany = () => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Selecciona una empresa para eliminar",
        variant: "destructive"
      });
      return;
    }

    const updatedCompanies = companies.filter(c => c.id !== selectedCompany);
    setCompanies(updatedCompanies);
    localStorage.setItem('certificate_company_configs', JSON.stringify(updatedCompanies));
    
    createNewCompany();
    
    toast({
      title: "Empresa eliminada",
      description: "La configuración de la empresa se ha eliminado correctamente"
    });
  };

  // Debug button para verificar el estado
  const debugLocalStorage = () => {
    const saved = localStorage.getItem('certificate_company_configs');
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('Raw data:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Parsed data:', parsed);
        console.log('Companies count:', parsed.length);
        parsed.forEach((company: any, index: number) => {
          console.log(`Company ${index}:`, {
            id: company.id,
            name: company.companyName,
            hasLogo: !!company.logoUrl,
            logoType: company.logoUrl?.startsWith('data:') ? 'base64' : 'url',
            signatories: company.signatories?.length || 0
          });
        });
      } catch (error) {
        console.error('Error parsing:', error);
      }
    }
    console.log('=== END DEBUG ===');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Personalización de Certificados por Empresa</CardTitle>
            <Button onClick={debugLocalStorage} variant="outline" size="sm">
              Debug
            </Button>
          </div>
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
                <option value="">Nueva empresa...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName} {company.logoUrl ? '(con logo)' : '(sin logo)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={createNewCompany} className="mt-6">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Empresa
              </Button>
              {selectedCompany && !isNewCompany && (
                <Button 
                  onClick={deleteCompany} 
                  variant="destructive"
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
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
                    {currentConfig.logoUrl && (
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
                  
                  {currentConfig.logoUrl && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <img
                        src={currentConfig.logoUrl}
                        alt="Logo preview"
                        className="max-h-20 w-auto border rounded"
                        onError={(e) => {
                          console.error('Error al cargar imagen de logo:', e);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onLoad={() => console.log('Logo cargado correctamente en la vista previa')}
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
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => signatureInputRefs.current[index]?.click()}
                            className="flex items-center gap-1"
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
                              onError={(e) => {
                                console.error('Error al cargar imagen de firma:', e);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                              onLoad={() => console.log('Firma cargada correctamente en la vista previa')}
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
              {isNewCompany || !selectedCompany ? 'Crear Empresa' : 'Actualizar Configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateCustomization;
