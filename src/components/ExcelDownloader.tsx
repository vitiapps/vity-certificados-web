
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

      const wb = XLSX.utils.book_new();
      
      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      const colWidths = [
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, 
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, 
        { wch: 12 }, { wch: 10 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Empleados Actuales");

      const templateData = [
        {
          'Nombre': '',
          'Número Documento': '',
          'Tipo Documento': 'CC',
          'Correo': '',
          'Cargo': '',
          'Empresa': 'Vity',
          'Tipo Contrato': 'Indefinido',
          'Fecha Ingreso': '',
          'Fecha Retiro': '',
          'Estado': 'Activo',
          'Sueldo': ''
        }
      ];

      const templateWs = XLSX.utils.json_to_sheet(templateData);
      templateWs['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, templateWs, "Plantilla Nuevos");

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `empleados_${dateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);

      toast({
        title: "¡Descarga exitosa!",
        description: `Archivo descargado: ${fileName}`
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
        <h3 className="font-semibold text-green-800 mb-3">Descargar Base de Empleados</h3>
        
        <div className="bg-white rounded-md p-3 border border-green-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-green-800">📊 Hoja 1:</span>
              <span className="text-green-600"> Empleados actuales</span>
            </div>
            <div>
              <span className="font-medium text-green-800">📝 Hoja 2:</span>
              <span className="text-green-600"> Plantilla para nuevos</span>
            </div>
          </div>
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
    </div>
  );
};

export default ExcelDownloader;
