
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Upload, File } from 'lucide-react';

interface EmployeeData {
  nombre: string;
  numero_documento: string;
  tipo_documento: string;
  correo: string;
  cargo: string;
  empresa: string;
  tipo_contrato: string;
  fecha_ingreso: string;
  fecha_retiro?: string;
  estado: string;
  sueldo?: number;
}

const ExcelUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<EmployeeData[]>([]);
  const { toast } = useToast();

  const formatDateForDB = (dateValue: any): string | null => {
    if (!dateValue || dateValue === '') return null;
    
    try {
      let date: Date;
      
      // Si es un número de serie de Excel
      if (typeof dateValue === 'number') {
        // Excel date serial number conversion
        date = new Date((dateValue - 25569) * 86400 * 1000);
      } 
      // Si es una fecha de JavaScript
      else if (dateValue instanceof Date) {
        date = dateValue;
      } 
      // Si es un string, intentar parsearlo
      else if (typeof dateValue === 'string') {
        // Intentar diferentes formatos
        const cleanDate = dateValue.trim();
        if (cleanDate === '') return null;
        
        // Formato DD/MM/YYYY o DD-MM-YYYY
        if (cleanDate.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/)) {
          const parts = cleanDate.split(/[\/\-]/);
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        // Formato YYYY-MM-DD
        else if (cleanDate.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
          date = new Date(cleanDate);
        }
        // Otros formatos
        else {
          date = new Date(cleanDate);
        }
      } 
      else {
        return null;
      }
      
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateValue);
        return null;
      }
      
      // Formatear como YYYY-MM-DD para PostgreSQL
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return null;
    }
  };

  const mapExcelRowToEmployee = (row: any): EmployeeData | null => {
    console.log('Raw row data:', row);
    
    // Try different possible column names
    const nombre = row['Nombre'] || row['nombre'] || row['NOMBRE'] || row['Name'] || '';
    const numero_documento = String(row['Número Documento'] || row['numero_documento'] || row['NUMERO_DOCUMENTO'] || row['Cedula'] || row['cedula'] || row['CEDULA'] || row['Document'] || '').trim();
    const correo = row['Correo'] || row['correo'] || row['CORREO'] || row['Email'] || row['email'] || row['EMAIL'] || '';
    const cargo = row['Cargo'] || row['cargo'] || row['CARGO'] || row['Position'] || '';
    
    // Skip rows with missing critical data
    if (!nombre || !numero_documento) {
      console.log('Skipping row due to missing critical data:', { nombre, numero_documento });
      return null;
    }

    // Format dates
    const fechaIngresoRaw = row['Fecha Ingreso'] || row['fecha_ingreso'] || row['FECHA_INGRESO'] || row['Fecha de Ingreso'] || '';
    const fechaRetiroRaw = row['Fecha Retiro'] || row['fecha_retiro'] || row['FECHA_RETIRO'] || row['Fecha de Retiro'] || '';
    
    const fechaIngreso = formatDateForDB(fechaIngresoRaw);
    const fechaRetiro = formatDateForDB(fechaRetiroRaw);

    // If fecha_ingreso is required and couldn't be formatted, skip the row
    if (!fechaIngreso) {
      console.log('Skipping row due to invalid fecha_ingreso:', fechaIngresoRaw);
      return null;
    }

    return {
      nombre: nombre.trim(),
      numero_documento: numero_documento,
      tipo_documento: row['Tipo Documento'] || row['tipo_documento'] || row['TIPO_DOCUMENTO'] || 'CC',
      correo: correo.trim(),
      cargo: cargo.trim(),
      empresa: row['Empresa'] || row['empresa'] || row['EMPRESA'] || 'Vity',
      tipo_contrato: row['Tipo Contrato'] || row['tipo_contrato'] || row['TIPO_CONTRATO'] || 'Indefinido',
      fecha_ingreso: fechaIngreso,
      fecha_retiro: fechaRetiro || undefined,
      estado: row['Estado'] || row['estado'] || row['ESTADO'] || 'Activo',
      sueldo: row['Sueldo'] || row['sueldo'] || row['SUELDO'] || null
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    
    // Leer y mostrar preview del archivo
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileData = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileData, { type: 'array', cellDates: true, cellNF: false, cellText: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row detection
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        }) as any[][];
        
        console.log('Raw Excel data:', jsonData);

        if (jsonData.length < 2) {
          toast({
            title: "Error",
            description: "El archivo debe contener al menos una fila de encabezados y una fila de datos",
            variant: "destructive"
          });
          return;
        }

        // Get headers (first row)
        const headers = jsonData[0];
        console.log('Headers found:', headers);

        // Convert rows to objects using headers
        const rowObjects = jsonData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        console.log('Row objects:', rowObjects);

        // Map to employee data
        const mappedData: EmployeeData[] = rowObjects
          .map(mapExcelRowToEmployee)
          .filter((emp): emp is EmployeeData => emp !== null);

        console.log('Mapped employee data:', mappedData);

        setPreview(mappedData.slice(0, 5)); // Mostrar solo los primeros 5 para preview
        
        toast({
          title: "Archivo cargado",
          description: `Se encontraron ${mappedData.length} registros válidos. Revisa el preview antes de guardar.`
        });
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: "Error",
          description: "No se pudo leer el archivo Excel. Verifica el formato.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const uploadData = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(uploadData, { type: 'array', cellDates: true, cellNF: false, cellText: false });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row detection
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][];

          // Get headers and convert to objects
          const headers = jsonData[0];
          const rowObjects = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          // Map and filter employee data
          const employeesData: EmployeeData[] = rowObjects
            .map(mapExcelRowToEmployee)
            .filter((emp): emp is EmployeeData => emp !== null);

          console.log('Final datos a insertar:', employeesData);

          if (employeesData.length === 0) {
            toast({
              title: "Error",
              description: "No se encontraron registros válidos en el archivo",
              variant: "destructive"
            });
            return;
          }

          // Insertar en la base de datos usando upsert para actualizar existentes
          const { data: insertResult, error } = await supabase
            .from('empleados')
            .upsert(employeesData, { 
              onConflict: 'numero_documento',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error('Error inserting data:', error);
            toast({
              title: "Error",
              description: `Error al guardar los datos: ${error.message}`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "¡Éxito!",
              description: `Se procesaron ${employeesData.length} empleados correctamente.`
            });
            setFile(null);
            setPreview([]);
            // Reset input
            const input = document.getElementById('excel-file') as HTMLInputElement;
            if (input) input.value = '';
          }
        } catch (error) {
          console.error('Processing error:', error);
          toast({
            title: "Error",
            description: "Error al procesar el archivo. Verifica el formato.",
            variant: "destructive"
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Error al cargar el archivo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Formato del Excel</h3>
        <p className="text-blue-600 text-sm mb-2">
          El archivo debe contener las siguientes columnas (pueden estar en español o inglés):
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-600">
          <span>• Nombre / Name</span>
          <span>• Número Documento / Cedula</span>
          <span>• Correo / Email</span>
          <span>• Cargo / Position</span>
          <span>• Empresa</span>
          <span>• Tipo Contrato</span>
          <span>• Fecha Ingreso (DD/MM/YYYY)</span>
          <span>• Estado</span>
        </div>
        <p className="text-blue-600 text-xs mt-2">
          <strong>Importante:</strong> La primera fila debe contener los encabezados de las columnas.
          Las fechas deben estar en formato DD/MM/YYYY o ser fechas válidas de Excel.
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="excel-file" className="text-gray-700 font-medium">
          Seleccionar archivo Excel
        </Label>
        <Input
          id="excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="h-12"
          disabled={isLoading}
        />
      </div>

      {preview.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Preview (primeros 5 registros):</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Nombre</th>
                  <th className="border border-gray-300 p-2">Documento</th>
                  <th className="border border-gray-300 p-2">Correo</th>
                  <th className="border border-gray-300 p-2">Cargo</th>
                  <th className="border border-gray-300 p-2">Fecha Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((emp, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{emp.nombre}</td>
                    <td className="border border-gray-300 p-2">{emp.numero_documento}</td>
                    <td className="border border-gray-300 p-2">{emp.correo}</td>
                    <td className="border border-gray-300 p-2">{emp.cargo}</td>
                    <td className="border border-gray-300 p-2">{emp.fecha_ingreso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {file && (
        <Button 
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full h-12 bg-vity-green hover:bg-vity-green-dark text-white font-semibold"
        >
          {isLoading ? 'Procesando...' : 'Guardar Empleados'}
          <Upload className="ml-2" size={16} />
        </Button>
      )}
    </div>
  );
};

export default ExcelUploader;
