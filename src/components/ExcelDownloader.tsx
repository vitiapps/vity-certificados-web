
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

const ExcelDownloader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const downloadEmployeeTemplate = async () => {
    setIsLoading(true);
    
    try {
      // Obtener todos los empleados de la base de datos
      const { data: employees, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Error al obtener los datos de empleados",
          variant: "destructive"
        });
        return;
      }

      // Formatear los datos para Excel
      const formattedData = employees?.map(emp => ({
        'Nombre': emp.nombre,
        'Número Documento': emp.numero_documento,
        'Tipo Documento': emp.tipo_documento,
        'Correo': emp.correo,
        'Cargo': emp.cargo,
        'Empresa': emp.empresa,
        'Tipo Contrato': emp.tipo_contrato,
        'Fecha Ingreso': emp.fecha_ingreso,
        'Fecha Retiro': emp.fecha_retiro || '',
        'Estado': emp.estado,
        'Sueldo': emp.sueldo || ''
      })) || [];

      // Crear el workbook
      const wb = XLSX.utils.book_new();
      
      // Crear la hoja con los datos actuales
      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      // Ajustar el ancho de las columnas
      const colWidths = [
        { wch: 25 }, // Nombre
        { wch: 15 }, // Número Documento
        { wch: 12 }, // Tipo Documento
        { wch: 30 }, // Correo
        { wch: 20 }, // Cargo
        { wch: 15 }, // Empresa
        { wch: 15 }, // Tipo Contrato
        { wch: 12 }, // Fecha Ingreso
        { wch: 12 }, // Fecha Retiro
        { wch: 10 }, // Estado
        { wch: 12 }  // Sueldo
      ];
      ws['!cols'] = colWidths;

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, "Empleados Actuales");

      // Crear una hoja de plantilla vacía para nuevos empleados
      const templateData = [
        {
          'Nombre': 'Ejemplo Empleado',
          'Número Documento': '12345678',
          'Tipo Documento': 'CC',
          'Correo': 'ejemplo@empresa.com',
          'Cargo': 'Desarrollador',
          'Empresa': 'Vity',
          'Tipo Contrato': 'Indefinido',
          'Fecha Ingreso': '01/01/2024',
          'Fecha Retiro': '',
          'Estado': 'Activo',
          'Sueldo': '5000000'
        }
      ];

      const templateWs = XLSX.utils.json_to_sheet(templateData);
      templateWs['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, templateWs, "Plantilla Nuevos");

      // Generar el nombre del archivo con la fecha actual
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `empleados_${dateStr}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, fileName);

      toast({
        title: "¡Descarga exitosa!",
        description: `Se descargó el archivo: ${fileName}`
      });

    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Error al generar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">Descargar Base de Empleados</h3>
        <p className="text-green-600 text-sm mb-3">
          Descarga un archivo Excel con todos los empleados actuales y una plantilla para nuevos registros.
        </p>
        <ul className="text-green-600 text-xs space-y-1 mb-3">
          <li>• <strong>Hoja 1:</strong> Empleados actuales - Para realizar actualizaciones</li>
          <li>• <strong>Hoja 2:</strong> Plantilla - Para agregar nuevos empleados</li>
          <li>• Puedes modificar datos existentes y cargar el archivo actualizado</li>
          <li>• Solo se procesarán los cambios detectados</li>
        </ul>
      </div>

      <Button 
        onClick={downloadEmployeeTemplate}
        disabled={isLoading}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
      >
        {isLoading ? 'Generando archivo...' : 'Descargar Base de Empleados'}
        <Download className="ml-2" size={16} />
      </Button>
    </div>
  );
};

export default ExcelDownloader;
