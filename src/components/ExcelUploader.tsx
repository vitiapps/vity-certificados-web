import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
interface UploadStatus {
  isUploading: boolean;
  progress: number;
  currentStep: string;
  success: boolean;
  error: string | null;
}
const ExcelUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    currentStep: '',
    success: false,
    error: null
  });
  const {
    toast
  } = useToast();
  const resetUploadStatus = () => {
    setUploadStatus({
      isUploading: false,
      progress: 0,
      currentStep: '',
      success: false,
      error: null
    });
  };
  const updateProgress = (progress: number, step: string) => {
    setUploadStatus(prev => ({
      ...prev,
      progress,
      currentStep: step
    }));
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      resetUploadStatus();
      setFile(selectedFile);
    }
  };
  const processExcelFile = useCallback(async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, {
            type: 'array'
          });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const uploadFile = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus({
      isUploading: true,
      progress: 0,
      currentStep: 'Iniciando carga...',
      success: false,
      error: null
    });

    try {
      updateProgress(10, 'Leyendo archivo Excel...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const jsonData = await processExcelFile(file);
      
      if (!jsonData || jsonData.length === 0) {
        throw new Error('El archivo está vacío o no contiene datos válidos');
      }

      updateProgress(30, 'Validando datos...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const validData = jsonData.filter(row => {
        const requiredFields = ['nombre', 'numero_documento', 'correo'];
        return requiredFields.every(field => row[field] && row[field].toString().trim() !== '');
      });

      if (validData.length === 0) {
        throw new Error('No se encontraron registros válidos en el archivo');
      }

      updateProgress(50, 'Preparando datos para insertar...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const batchSize = 50;
      const totalBatches = Math.ceil(validData.length / batchSize);
      let processedBatches = 0;

      for (let i = 0; i < validData.length; i += batchSize) {
        const batch = validData.slice(i, i + batchSize);
        
        const formattedBatch = batch.map(row => ({
          nombre: row.nombre?.toString().trim() || '',
          numero_documento: row.numero_documento?.toString().trim() || '',
          tipo_documento: row.tipo_documento?.toString().trim() || 'CC',
          correo: row.correo?.toString().trim() || '',
          cargo: row.cargo?.toString().trim() || '',
          empresa: row.empresa?.toString().trim() || '',
          tipo_contrato: row.tipo_contrato?.toString().trim() || '',
          estado: row.estado?.toString().trim() || 'Activo',
          fecha_ingreso: row.fecha_ingreso || new Date().toISOString().split('T')[0],
          fecha_retiro: row.fecha_retiro || null,
          sueldo: row.sueldo ? parseFloat(row.sueldo.toString()) : null,
          promedio_salarial_mensual: row.promedio_salarial_mensual ? parseFloat(row.promedio_salarial_mensual.toString()) : 0,
          promedio_no_salarial_mensual: row.promedio_no_salarial_mensual ? parseFloat(row.promedio_no_salarial_mensual.toString()) : 0
        }));

        updateProgress(
          50 + (processedBatches / totalBatches * 40), 
          `Insertando lote ${processedBatches + 1} de ${totalBatches}...`
        );

        const { error } = await supabase
          .from('empleados')
          .upsert(formattedBatch, {
            onConflict: 'numero_documento',
            ignoreDuplicates: false
          });

        if (error) {
          throw error;
        }

        processedBatches++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      updateProgress(100, 'Carga completada exitosamente');
      
      setUploadStatus({
        isUploading: false,
        progress: 100,
        currentStep: `${validData.length} empleados cargados correctamente`,
        success: true,
        error: null
      });

      toast({
        title: "Éxito",
        description: `Se cargaron ${validData.length} empleados correctamente`
      });

      setTimeout(() => {
        setFile(null);
        resetUploadStatus();
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 3000);

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setUploadStatus({
        isUploading: false,
        progress: 0,
        currentStep: '',
        success: false,
        error: errorMessage
      });

      toast({
        title: "Error",
        description: `Error al cargar el archivo: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-vity-green" />
            Cargar Archivo Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700">
              Seleccionar archivo Excel (.xlsx, .xls)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploadStatus.isUploading} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-vity-green file:text-white hover:file:bg-vity-green-dark" />
              </div>
              <Button onClick={uploadFile} disabled={!file || uploadStatus.isUploading} className="bg-vity-green hover:bg-vity-green-dark flex items-center gap-2 whitespace-nowrap">
                <FileSpreadsheet className="h-4 w-4" />
                {uploadStatus.isUploading ? 'Cargando...' : 'Subir Archivo'}
              </Button>
            </div>
          </div>

          {file && !uploadStatus.isUploading && !uploadStatus.success && <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Archivo seleccionado:</strong> {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>}

          {uploadStatus.isUploading && <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-vity-green border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">{uploadStatus.currentStep}</span>
              </div>
              <Progress value={uploadStatus.progress} className="w-full" />
              <p className="text-xs text-gray-500 text-center">
                {uploadStatus.progress.toFixed(0)}% completado
              </p>
            </div>}

          {uploadStatus.success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">{uploadStatus.currentStep}</p>
            </div>}

          {uploadStatus.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error en la carga</p>
                <p className="text-xs text-red-600 mt-1">{uploadStatus.error}</p>
              </div>
            </div>}
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        
        <CardContent>
          

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
            <p className="text-xs text-yellow-800">
              <strong>Notas importantes:</strong><br />
              • <strong>nombre</strong> - Ejemplo: Juan Pérez<br />
              • <strong>numero_documento</strong> - Ejemplo: 12345678<br />
              • <strong>tipo_documento</strong> - Ejemplo: CC, CE, TI<br />
              • <strong>correo</strong> - Ejemplo: juan@email.com<br />
              • <strong>cargo</strong> - Ejemplo: Desarrollador<br />
              • <strong>empresa</strong> - Ejemplo: Vity SAS<br />
              • <strong>tipo_contrato</strong> - Ejemplo: Indefinido, Fijo<br />
              • <strong>fecha_ingreso</strong> - Formato: YYYY-MM-DD (ej: 2024-01-15)<br />
              • <strong>estado</strong> - Ejemplo: Activo, Inactivo<br />
              • <strong>fecha_retiro</strong> - Formato: YYYY-MM-DD (opcional, puede estar vacía)<br />
              • <strong>sueldo</strong> - Ejemplo: 3500000 (numérico sin puntos ni comas)<br />
              • <strong>promedio_salarial_mensual</strong> - Ejemplo: 3200000 (numérico sin puntos ni comas)<br />
              • <strong>promedio_no_salarial_mensual</strong> - Ejemplo: 800000 (numérico sin puntos ni comas)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default ExcelUploader;
