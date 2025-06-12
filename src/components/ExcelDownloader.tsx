
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Database } from 'lucide-react';

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
        'Sueldo': emp.sueldo || '',
        'Promedio Salarial Mensual': emp.promedio_salarial_mensual || '',
        'Promedio No Salarial Mensual': emp.promedio_no_salarial_mensual || ''
      })) || [];

      const wb = XLSX.utils.book_new();
      
      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      const colWidths = [
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, 
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, 
        { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 22 }
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
          'Sueldo': '',
          'Promedio Salarial Mensual': '',
          'Promedio No Salarial Mensual': ''
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
    <Card className="border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-vity-green" />
          Descargar Base de Empleados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-vity-green" />
            <span className="text-sm text-gray-700">Empleados actuales</span>
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-vity-green" />
            <span className="text-sm text-gray-700">Plantilla para nuevos</span>
          </div>
        </div>

        <Button 
          onClick={downloadEmployeeTemplate}
          disabled={isLoading}
          className="w-full bg-vity-green hover:bg-vity-green-dark text-white flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Descargar Base de Empleados
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExcelDownloader;
