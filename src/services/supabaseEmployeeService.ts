
import { supabase } from '@/integrations/supabase/client';

interface EmployeeData {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  nombre: string;
  cargo: string;
  empresa: string;
  estado: string;
  sueldo: number;
  fecha_ingreso: string;
  fecha_retiro?: string;
  tipo_contrato: string;
  correo: string;
}

interface CertificationHistory {
  id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  tipo_certificacion: string;
  fecha_generacion: string;
  generado_por: string;
  detalles: any;
}

class SupabaseEmployeeService {
  async findEmployeeByDocument(numeroDocumento: string): Promise<EmployeeData | null> {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('numero_documento', numeroDocumento)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el empleado
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        nombre: data.nombre,
        cargo: data.cargo,
        empresa: data.empresa,
        estado: data.estado,
        sueldo: data.sueldo || 0,
        fecha_ingreso: data.fecha_ingreso,
        fecha_retiro: data.fecha_retiro,
        tipo_contrato: data.tipo_contrato,
        correo: data.correo
      };
    } catch (error) {
      console.error('Error finding employee:', error);
      throw error;
    }
  }

  async saveCertificationHistory(certification: Omit<CertificationHistory, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('certificaciones_historico')
        .insert([{
          empleado_id: certification.empleado_id,
          nombre_empleado: certification.nombre_empleado,
          numero_documento: certification.numero_documento,
          tipo_certificacion: certification.tipo_certificacion,
          fecha_generacion: certification.fecha_generacion,
          generado_por: certification.generado_por,
          detalles: certification.detalles
        }]);

      if (error) {
        console.error('Error saving certification history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving certification history:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('empleados')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return true; // Supabase está siempre configurado
  }
}

export const supabaseEmployeeService = new SupabaseEmployeeService();
export type { EmployeeData, CertificationHistory };
