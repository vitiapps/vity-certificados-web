
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Calendar, FileText } from 'lucide-react';

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
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Filtrar registros basado en el término de búsqueda
    const filtered = records.filter(record => 
      record.nombre_empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.numero_documento.includes(searchTerm) ||
      record.tipo_certificacion.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        placeholder="Buscar por nombre, documento o tipo de certificación..."
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
                <TableHead className="hidden md:table-cell">Tipo Certificación</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha Generación</TableHead>
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
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(record.fecha_generacion)}
                    </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
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
