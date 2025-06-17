import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info, XCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  type: 'error' | 'warning';
}

interface ValidationResult {
  validRecords: any[];
  invalidRecords: any[];
  errors: ValidationError[];
  warnings: ValidationError[];
  totalProcessed: number;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  currentStep: string;
  success: boolean;
  error: string | null;
  validationResult?: ValidationResult;
  showValidationDetails: boolean;
}

const ExcelUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    currentStep: '',
    success: false,
    error: null,
    showValidationDetails: false
  });
  const { toast } = useToast();

  const resetUploadStatus = () => {
    setUploadStatus({
      isUploading: false,
      progress: 0,
      currentStep: '',
      success: false,
      error: null,
      showValidationDetails: false
    });
  };

  const updateProgress = (progress: number, step: string) => {
    setUploadStatus(prev => ({
      ...prev,
      progress,
      currentStep: step
    }));
  };

  // Función para convertir números seriales de Excel a fechas
  const excelSerialToDate = (serial: number): string | null => {
    try {
      // Excel cuenta los días desde 1900-01-01, pero tiene un bug donde considera 1900 como año bisiesto
      const excelEpoch = new Date(1900, 0, 1);
      const msPerDay = 24 * 60 * 60 * 1000;
      
      // Ajustar por el bug de Excel (día 60 = 29/02/1900 que no existe)
      const adjustedSerial = serial > 59 ? serial - 1 : serial;
      
      const date = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * msPerDay);
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error converting Excel serial to date:', error);
      return null;
    }
  };

  // Función para normalizar fechas desde Excel
  const normalizeDateFromExcel = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    console.log('Processing date value:', dateValue, 'Type:', typeof dateValue);
    
    // Si es un número (serial de Excel)
    if (typeof dateValue === 'number') {
      return excelSerialToDate(dateValue);
    }
    
    // Si es string, intentar parsearlo
    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim();
      if (trimmed === '') return null;
      
      // Intentar diferentes formatos de fecha
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // Si es objeto Date
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split('T')[0];
      }
    }
    
    console.warn('Unable to parse date value:', dateValue);
    return null;
  };

  const validateRecord = (record: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    console.log(`Validating record ${rowIndex}:`, record);
    
    // Validaciones obligatorias
    if (!record.nombre || record.nombre.toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'nombre',
        value: record.nombre,
        error: 'El nombre es obligatorio',
        type: 'error'
      });
    }

    if (!record.numero_documento || record.numero_documento.toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'numero_documento',
        value: record.numero_documento,
        error: 'El número de documento es obligatorio',
        type: 'error'
      });
    } else {
      // Validar que el número de documento sea numérico
      const docNumber = record.numero_documento.toString();
      if (!/^\d+$/.test(docNumber)) {
        errors.push({
          row: rowIndex,
          field: 'numero_documento',
          value: record.numero_documento,
          error: 'El número de documento debe contener solo números',
          type: 'error'
        });
      }
    }

    if (!record.correo || record.correo.toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'correo',
        value: record.correo,
        error: 'El correo es obligatorio',
        type: 'error'
      });
    } else {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.correo.toString())) {
        errors.push({
          row: rowIndex,
          field: 'correo',
          value: record.correo,
          error: 'El formato del correo no es válido',
          type: 'error'
        });
      }
    }

    // Validaciones de advertencia
    if (!record.cargo || record.cargo.toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'cargo',
        value: record.cargo,
        error: 'Se recomienda especificar el cargo',
        type: 'warning'
      });
    }

    if (!record.empresa || record.empresa.toString().trim() === '') {
      errors.push({
        row: rowIndex,
        field: 'empresa',
        value: record.empresa,
        error: 'Se recomienda especificar la empresa',
        type: 'warning'
      });
    }

    // Validar fecha de ingreso con mejor manejo
    if (record.fecha_ingreso) {
      const normalizedDate = normalizeDateFromExcel(record.fecha_ingreso);
      if (!normalizedDate) {
        errors.push({
          row: rowIndex,
          field: 'fecha_ingreso',
          value: record.fecha_ingreso,
          error: `Formato de fecha de ingreso inválido. Valor recibido: ${record.fecha_ingreso}`,
          type: 'error'
        });
      }
    }

    // Validar fecha de retiro con mejor manejo
    if (record.fecha_retiro) {
      const normalizedDate = normalizeDateFromExcel(record.fecha_retiro);
      if (!normalizedDate) {
        errors.push({
          row: rowIndex,
          field: 'fecha_retiro',
          value: record.fecha_retiro,
          error: `Formato de fecha de retiro inválido. Valor recibido: ${record.fecha_retiro}`,
          type: 'warning'
        });
      }
    }

    // Validar sueldo si está presente
    if (record.sueldo && isNaN(parseFloat(record.sueldo.toString()))) {
      errors.push({
        row: rowIndex,
        field: 'sueldo',
        value: record.sueldo,
        error: 'El sueldo debe ser un número válido',
        type: 'warning'
      });
    }

    return errors;
  };

  const validateData = (jsonData: any[]): ValidationResult => {
    const allErrors: ValidationError[] = [];
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    jsonData.forEach((record, index) => {
      const recordErrors = validateRecord(record, index + 2); // +2 porque Excel empieza en fila 1 y la primera es header
      allErrors.push(...recordErrors);

      const hasErrors = recordErrors.some(error => error.type === 'error');
      if (hasErrors) {
        invalidRecords.push({ ...record, rowIndex: index + 2, errors: recordErrors });
      } else {
        validRecords.push(record);
      }
    });

    return {
      validRecords,
      invalidRecords,
      errors: allErrors.filter(e => e.type === 'error'),
      warnings: allErrors.filter(e => e.type === 'warning'),
      totalProcessed: jsonData.length
    };
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
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });
          
          console.log('Processed Excel data:', jsonData);
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
      error: null,
      showValidationDetails: false
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
      
      const validationResult = validateData(jsonData);
      
      setUploadStatus(prev => ({
        ...prev,
        validationResult,
        showValidationDetails: true
      }));

      if (validationResult.errors.length > 0) {
        updateProgress(40, `Se encontraron ${validationResult.errors.length} errores que deben corregirse`);
        
        toast({
          title: "Errores de validación",
          description: `Se encontraron ${validationResult.errors.length} errores. Revisa los detalles abajo.`,
          variant: "destructive"
        });
        
        setUploadStatus(prev => ({
          ...prev,
          isUploading: false,
          error: `Se encontraron ${validationResult.errors.length} errores de validación`
        }));
        return;
      }

      if (validationResult.warnings.length > 0) {
        updateProgress(45, `Se encontraron ${validationResult.warnings.length} advertencias`);
        toast({
          title: "Advertencias encontradas",
          description: `${validationResult.warnings.length} registros tienen advertencias pero se pueden cargar.`,
        });
      }

      updateProgress(50, 'Preparando datos para insertar...');
      await new Promise(resolve => setTimeout(resolve, 300));

      const validData = validationResult.validRecords;
      const batchSize = 50;
      const totalBatches = Math.ceil(validData.length / batchSize);
      let processedBatches = 0;

      for (let i = 0; i < validData.length; i += batchSize) {
        const batch = validData.slice(i, i + batchSize);
        const formattedBatch = batch.map(row => {
          const fechaIngreso = normalizeDateFromExcel(row.fecha_ingreso) || new Date().toISOString().split('T')[0];
          const fechaRetiro = row.fecha_retiro ? normalizeDateFromExcel(row.fecha_retiro) : null;
          
          console.log(`Processing batch record:`, {
            nombre: row.nombre,
            fecha_ingreso_original: row.fecha_ingreso,
            fecha_ingreso_processed: fechaIngreso,
            fecha_retiro_original: row.fecha_retiro,
            fecha_retiro_processed: fechaRetiro
          });
          
          return {
            nombre: row.nombre?.toString().trim() || '',
            numero_documento: row.numero_documento?.toString().trim() || '',
            tipo_documento: row.tipo_documento?.toString().trim() || 'CC',
            correo: row.correo?.toString().trim() || '',
            cargo: row.cargo?.toString().trim() || '',
            empresa: row.empresa?.toString().trim() || '',
            tipo_contrato: row.tipo_contrato?.toString().trim() || '',
            estado: row.estado?.toString().trim() || 'Activo',
            fecha_ingreso: fechaIngreso,
            fecha_retiro: fechaRetiro,
            sueldo: row.sueldo ? parseFloat(row.sueldo.toString()) : null
          };
        });

        updateProgress(50 + (processedBatches / totalBatches) * 40, `Insertando lote ${processedBatches + 1} de ${totalBatches}...`);

        console.log('Inserting batch:', formattedBatch);

        const { error } = await supabase
          .from('empleados')
          .upsert(formattedBatch, {
            onConflict: 'numero_documento',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        processedBatches++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      updateProgress(100, 'Carga completada exitosamente');
      
      setUploadStatus(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        currentStep: `${validData.length} empleados cargados correctamente${validationResult.warnings.length > 0 ? ` (${validationResult.warnings.length} con advertencias)` : ''}`,
        success: true,
        error: null
      }));

      toast({
        title: "Éxito",
        description: `Se cargaron ${validData.length} empleados correctamente`
      });

      setTimeout(() => {
        setFile(null);
        resetUploadStatus();
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 5000);

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setUploadStatus(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        currentStep: '',
        success: false,
        error: errorMessage
      }));
      toast({
        title: "Error",
        description: `Error al cargar el archivo: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const toggleValidationDetails = () => {
    setUploadStatus(prev => ({
      ...prev,
      showValidationDetails: !prev.showValidationDetails
    }));
  };

  return (
    <div className="space-y-6">
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
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploadStatus.isUploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-vity-green file:text-white hover:file:bg-vity-green-dark"
                />
              </div>
              <Button
                onClick={uploadFile}
                disabled={!file || uploadStatus.isUploading}
                className="bg-vity-green hover:bg-vity-green-dark flex items-center gap-2 whitespace-nowrap"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {uploadStatus.isUploading ? 'Cargando...' : 'Subir Archivo'}
              </Button>
            </div>
          </div>

          {file && !uploadStatus.isUploading && !uploadStatus.success && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Archivo seleccionado:</strong> {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {uploadStatus.isUploading && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-vity-green border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">{uploadStatus.currentStep}</span>
              </div>
              <Progress value={uploadStatus.progress} className="w-full" />
              <p className="text-xs text-gray-500 text-center">
                {uploadStatus.progress.toFixed(0)}% completado
              </p>
            </div>
          )}

          {uploadStatus.validationResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Resultado de Validación</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleValidationDetails}
                  className="text-xs"
                >
                  {uploadStatus.showValidationDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Válidos</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{uploadStatus.validationResult.validRecords.length}</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Advertencias</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-600">{uploadStatus.validationResult.warnings.length}</p>
                </div>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Errores</span>
                  </div>
                  <p className="text-lg font-bold text-red-600">{uploadStatus.validationResult.errors.length}</p>
                </div>
              </div>

              {uploadStatus.showValidationDetails && (uploadStatus.validationResult.errors.length > 0 || uploadStatus.validationResult.warnings.length > 0) && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {uploadStatus.validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-800 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Errores ({uploadStatus.validationResult.errors.length})
                      </h4>
                      <div className="space-y-1">
                        {uploadStatus.validationResult.errors.map((error, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <span className="font-medium">Fila {error.row}:</span> {error.error}
                            <span className="text-red-600"> (Campo: {error.field}, Valor: "{error.value}")</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadStatus.validationResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Advertencias ({uploadStatus.validationResult.warnings.length})
                      </h4>
                      <div className="space-y-1">
                        {uploadStatus.validationResult.warnings.map((warning, index) => (
                          <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <span className="font-medium">Fila {warning.row}:</span> {warning.error}
                            <span className="text-yellow-600"> (Campo: {warning.field})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {uploadStatus.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">{uploadStatus.currentStep}</p>
            </div>
          )}

          {uploadStatus.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error en la carga</p>
                <p className="text-xs text-red-600 mt-1">{uploadStatus.error}</p>
              </div>
            </div>
          )}
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
              • <strong>fecha_ingreso</strong> - Formato: YYYY-MM-DD (ej: 2024-01-15) o fecha de Excel<br />
              • <strong>estado</strong> - Ejemplo: Activo, Inactivo<br />
              • <strong>fecha_retiro</strong> - Formato: YYYY-MM-DD (opcional, puede estar vacía) o fecha de Excel<br />
              • <strong>sueldo</strong> - Ejemplo: 3500000 (numérico sin puntos ni comas)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUploader;
