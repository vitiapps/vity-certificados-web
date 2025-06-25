
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
  promedio_salarial_mensual: number;
  promedio_no_salarial_mensual: number;
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
      console.log('Buscando empleado con documento:', numeroDocumento);
      
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('numero_documento', numeroDocumento)
        .single();

      if (error) {
        console.error('Error en consulta de empleado:', error);
        if (error.code === 'PGRST116') {
          // No se encontró el empleado
          return null;
        }
        throw error;
      }

      console.log('Empleado encontrado:', data);
      return {
        id: data.id,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        nombre: data.nombre,
        cargo: data.cargo,
        empresa: data.empresa,
        estado: data.estado,
        sueldo: data.sueldo || 0,
        promedio_salarial_mensual: data.promedio_salarial_mensual || 0,
        promedio_no_salarial_mensual: data.promedio_no_salarial_mensual || 0,
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
      console.log('Guardando historial de certificación:', certification);
      
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

      console.log('Historial de certificación guardado exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving certification history:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Probando conexión con Supabase...');
      console.log('URL de Supabase:', supabase.supabaseUrl);
      console.log('Anon key presente:', !!supabase.supabaseKey);
      
      // Intentar una consulta simple
      const { data, error } = await supabase
        .from('empleados')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error en test de conexión:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje de error:', error.message);
        console.error('Detalles del error:', error.details);
        return false;
      }

      console.log('Conexión exitosa. Datos obtenidos:', data);
      return true;
    } catch (error) {
      console.error('Error en test de conexión (catch):', error);
      
      // Información adicional de diagnóstico
      if (error instanceof Error) {
        console.error('Tipo de error:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
      }
      
      // Verificar conectividad de red básica
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache'
        });
        console.log('✅ Conectividad de red básica OK');
      } catch (networkError) {
        console.error('❌ Sin conectividad de red básica:', networkError);
      }
      
      return false;
    }
  }

  async getConnectionDiagnostics(): Promise<{
    supabaseReachable: boolean;
    networkConnectivity: boolean;
    errorDetails: any;
  }> {
    const diagnostics = {
      supabaseReachable: false,
      networkConnectivity: false,
      errorDetails: null
    };

    try {
      // Test basic network connectivity
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      diagnostics.networkConnectivity = true;
      console.log('✅ Conectividad de red OK');
    } catch (error) {
      console.error('❌ Sin conectividad de red:', error);
      diagnostics.errorDetails = error;
    }

    try {
      // Test Supabase connectivity
      const { error } = await supabase
        .from('empleados')
        .select('id')
        .limit(1);

      if (!error) {
        diagnostics.supabaseReachable = true;
        console.log('✅ Supabase alcanzable');
      } else {
        console.error('❌ Error de Supabase:', error);
        diagnostics.errorDetails = error;
      }
    } catch (error) {
      console.error('❌ No se puede conectar a Supabase:', error);
      diagnostics.errorDetails = error;
    }

    return diagnostics;
  }

  isConfigured(): boolean {
    return true; // Supabase está siempre configurado
  }
}

export const supabaseEmployeeService = new SupabaseEmployeeService();
export type { EmployeeData, CertificationHistory };
