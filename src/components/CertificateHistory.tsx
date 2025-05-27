
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, FileText, Hash } from 'lucide-react';

interface CertificateHistoryRecord {
  id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  tipo_certificacion: string;
  fecha_generacion: string;
  generado_por: string | null;
  detalles: any;
  created_at: string;
}

const CertificateHistory: React.FC = () => {
  const [records, setRecords] = useState<CertificateHistoryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CertificateHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CertificateHistoryRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Filtrar registros basado en el término de búsqueda
    const filtered = records.filter(record => 
      record.nombre_empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.numero_documento.includes(searchTerm) ||
      record.tipo_certificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.detalles?.codigo_verificacion && record.detalles.codigo_verificacion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRecords(filtered);
  }, [records, searchTerm]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificaciones_historico')
        .select('*')
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('Error fetching certificate history:', error);
        toast({
          title: "Error",
          description: "Error al cargar el historial de certificaciones",
          variant: "destructive"
        });
      } else {
        console.log('Historial cargado:', data);
        setRecords(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar el historial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCertificateTypeName = (type: string): string => {
    const typeNames = {
      'empleado-activo': 'Empleado Activo',
      'empleado-retirado': 'Empleado Retirado',
      'historial-completo': 'Historial Completo'
    };
    return typeNames[type as keyof typeof typeNames] || type;
  };

  const getCertificateTypeColor = (type: string): string => {
    switch (type) {
      case 'empleado-activo':
        return 'bg-green-100 text-green-700';
      case 'empleado-retirado':
        return 'bg-red-100 text-red-700';
      case 'historial-completo':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const generateCertificateHTML = (record: CertificateHistoryRecord) => {
    const certificateContent = getCertificateContent(record);
    const currentDate = formatDateTime(record.fecha_generacion);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado Laboral - ${record.nombre_empleado}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            background: #f8f9fa;
        }
        .certificate {
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #22c55e;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0;
        }
        .content {
            font-size: 16px;
            color: #374151;
            text-align: justify;
            margin: 30px 0;
            line-height: 1.8;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .verification-code {
            font-family: monospace;
            font-size: 12px;
            background: #f3f4f6;
            padding: 5px 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        @media print {
            body { background: white; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="company-name">${record.detalles?.empresa?.toUpperCase() || 'EMPRESA'}</div>
            <div style="color: #6b7280;">NIT: 900.123.456-7</div>
            <div style="color: #6b7280;">Bogotá, Colombia</div>
        </div>

        <div style="text-align: center;">
            <h1 class="certificate-title">CERTIFICACIÓN LABORAL</h1>
            <div style="color: #6b7280; margin-bottom: 40px;">
                Fecha de expedición: ${currentDate}
            </div>
        </div>

        <div class="content">
            ${certificateContent}
        </div>

        <div class="footer">
            <p>Este certificado es válido con firma digital y código de verificación</p>
            <div class="verification-code">Código: ${record.detalles?.codigo_verificacion || 'N/A'}</div>
        </div>
    </div>
</body>
</html>`;
  };

  const getCertificateContent = (record: CertificateHistoryRecord) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('es-ES');
    };

    switch (record.tipo_certificacion) {
      case 'empleado-activo':
        return `La empresa ${record.detalles?.empresa} certifica que ${record.nombre_empleado}, identificado(a) con documento No. ${record.numero_documento}, se encuentra vinculado(a) laboralmente desempeñando el cargo de ${record.detalles?.cargo} con un salario de ${formatCurrency(record.detalles?.sueldo)}, y a la fecha continúa prestando sus servicios de manera activa.`;
      
      case 'empleado-retirado':
        return `La empresa ${record.detalles?.empresa} certifica que ${record.nombre_empleado}, identificado(a) con documento No. ${record.numero_documento}, laboró en la empresa desempeñando el cargo de ${record.detalles?.cargo} con un salario de ${formatCurrency(record.detalles?.sueldo)}, fecha en la cual se retiró de la organización.`;
      
      case 'historial-completo':
        const statusText = record.detalles?.estado === 'ACTIVO' 
          ? `se encuentra vinculado(a) laboralmente y a la fecha continúa prestando sus servicios`
          : `laboró en la empresa`;
        
        return `La empresa ${record.detalles?.empresa} certifica que ${record.nombre_empleado}, identificado(a) con documento No. ${record.numero_documento}, ${statusText} desempeñando el cargo de ${record.detalles?.cargo} con un salario de ${formatCurrency(record.detalles?.sueldo)}. Estado actual: ${record.detalles?.estado}.`;
      
      default:
        return '';
    }
  };

  const downloadCertificate = (record: CertificateHistoryRecord) => {
    try {
      const certificateHTML = generateCertificateHTML(record);
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado_laboral_${record.numero_documento}_${Date.now()}.html`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "¡Descarga completada!",
        description: "El certificado se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error al descargar el certificado:', error);
      toast({
        title: "Error en la descarga",
        description: "Hubo un problema al descargar el certificado. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-vity-green" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Historial de Certificaciones ({filteredRecords.length})
          </h3>
        </div>
        <Button onClick={fetchHistory} disabled={isLoading} size="sm">
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre, documento, tipo o código de verificación..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:max-w-md"
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vity-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Empleado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="min-w-[150px]">Fecha y Hora</TableHead>
                <TableHead className="min-w-[120px]">Código</TableHead>
                <TableHead className="hidden xl:table-cell">Generado Por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium min-w-[150px]">
                    {record.nombre_empleado}
                  </TableCell>
                  <TableCell>{record.numero_documento}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={getCertificateTypeColor(record.tipo_certificacion)}>
                      {getCertificateTypeName(record.tipo_certificacion)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(record.fecha_generacion)}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {record.detalles?.codigo_verificacion ? (
                      <div className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-2 py-1 rounded max-w-[120px]">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{record.detalles.codigo_verificacion}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin código</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {record.generado_por || 'Sistema'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">
                      Generado
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye size={12} />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Vista Previa del Certificado</DialogTitle>
                          </DialogHeader>
                          {selectedRecord && (
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-center border-b pb-4 mb-4">
                                  <h2 className="text-2xl font-bold text-vity-green">
                                    {selectedRecord.detalles?.empresa?.toUpperCase() || 'EMPRESA'}
                                  </h2>
                                  <p className="text-gray-600">NIT: 900.123.456-7</p>
                                  <p className="text-gray-600">Bogotá, Colombia</p>
                                </div>
                                
                                <div className="text-center mb-4">
                                  <h3 className="text-xl font-bold">CERTIFICACIÓN LABORAL</h3>
                                  <p className="text-sm text-gray-600">
                                    Fecha de expedición: {formatDateTime(selectedRecord.fecha_generacion)}
                                  </p>
                                </div>
                                
                                <div className="text-justify leading-relaxed mb-4">
                                  {getCertificateContent(selectedRecord)}
                                </div>
                                
                                <div className="text-center text-sm text-gray-600 border-t pt-4">
                                  <p>Este certificado es válido con firma digital y código de verificación</p>
                                  <p className="font-mono text-xs mt-2">
                                    Código: {selectedRecord.detalles?.codigo_verificacion || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => downloadCertificate(record)}
                      >
                        <Download size={12} />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-sm md:text-base">
                {searchTerm 
                  ? 'No se encontraron certificaciones con ese criterio de búsqueda' 
                  : 'No hay certificaciones generadas aún'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateHistory;
