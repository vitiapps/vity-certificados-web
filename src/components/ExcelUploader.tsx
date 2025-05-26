
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
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Mapear las columnas del Excel a nuestro formato
        const mappedData: EmployeeData[] = jsonData.map((row) => ({
          nombre: row['Nombre'] || row['nombre'] || '',
          numero_documento: String(row['Número Documento'] || row['numero_documento'] || row['Cedula'] || row['cedula'] || ''),
          tipo_documento: row['Tipo Documento'] || row['tipo_documento'] || 'CC',
          correo: row['Correo'] || row['correo'] || row['Email'] || row['email'] || '',
          cargo: row['Cargo'] || row['cargo'] || '',
          empresa: row['Empresa'] || row['empresa'] || 'Vity',
          tipo_contrato: row['Tipo Contrato'] || row['tipo_contrato'] || 'Indefinido',
          fecha_ingreso: row['Fecha Ingreso'] || row['fecha_ingreso'] || '',
          fecha_retiro: row['Fecha Retiro'] || row['fecha_retiro'] || null,
          estado: row['Estado'] || row['estado'] || 'Activo',
          sueldo: row['Sueldo'] || row['sueldo'] || null
        }));

        setPreview(mappedData.slice(0, 5)); // Mostrar solo los primeros 5 para preview
        
        toast({
          title: "Archivo cargado",
          description: `Se encontraron ${jsonData.length} registros. Revisa el preview antes de guardar.`
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
          const workbook = XLSX.read(uploadData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          // Mapear y limpiar datos
          const employeesData: EmployeeData[] = jsonData.map((row) => ({
            nombre: row['Nombre'] || row['nombre'] || '',
            numero_documento: String(row['Número Documento'] || row['numero_documento'] || row['Cedula'] || row['cedula'] || ''),
            tipo_documento: row['Tipo Documento'] || row['tipo_documento'] || 'CC',
            correo: row['Correo'] || row['correo'] || row['Email'] || row['email'] || '',
            cargo: row['Cargo'] || row['cargo'] || '',
            empresa: row['Empresa'] || row['empresa'] || 'Vity',
            tipo_contrato: row['Tipo Contrato'] || row['tipo_contrato'] || 'Indefinido',
            fecha_ingreso: row['Fecha Ingreso'] || row['fecha_ingreso'] || '',
            fecha_retiro: row['Fecha Retiro'] || row['fecha_retiro'] || null,
            estado: row['Estado'] || row['estado'] || 'Activo',
            sueldo: row['Sueldo'] || row['sueldo'] || null
          })).filter(emp => emp.nombre && emp.numero_documento); // Filtrar registros incompletos

          console.log('Datos a insertar:', employeesData);

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
          El archivo debe contener las siguientes columnas (pueden estar en español):
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-600">
          <span>• Nombre</span>
          <span>• Número Documento / Cedula</span>
          <span>• Correo / Email</span>
          <span>• Cargo</span>
          <span>• Empresa</span>
          <span>• Tipo Contrato</span>
          <span>• Fecha Ingreso</span>
          <span>• Estado</span>
        </div>
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
                </tr>
              </thead>
              <tbody>
                {preview.map((emp, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{emp.nombre}</td>
                    <td className="border border-gray-300 p-2">{emp.numero_documento}</td>
                    <td className="border border-gray-300 p-2">{emp.correo}</td>
                    <td className="border border-gray-300 p-2">{emp.cargo}</td>
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
