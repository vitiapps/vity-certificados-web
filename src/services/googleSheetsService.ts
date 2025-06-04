
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

class GoogleSheetsService {
  private spreadsheetId: string = '';
  private apiKey: string = '';
  
  setCredentials(spreadsheetId: string, apiKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.apiKey = apiKey;
    // Guardar en localStorage para persistencia
    localStorage.setItem('googleSheets_spreadsheetId', spreadsheetId);
    localStorage.setItem('googleSheets_apiKey', apiKey);
  }

  loadCredentials() {
    const savedSpreadsheetId = localStorage.getItem('googleSheets_spreadsheetId');
    const savedApiKey = localStorage.getItem('googleSheets_apiKey');
    
    if (savedSpreadsheetId && savedApiKey) {
      this.spreadsheetId = savedSpreadsheetId;
      this.apiKey = savedApiKey;
      return true;
    }
    return false;
  }

  isConfigured(): boolean {
    return !!(this.spreadsheetId && this.apiKey);
  }
  
  private async makeRequest(range: string, method: 'GET' | 'POST' = 'GET', values?: any[][]) {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets no está configurado. Por favor configura las credenciales primero.');
    }

    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
    
    if (method === 'GET') {
      const response = await fetch(
        `${baseUrl}/values/${range}?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Error en la API de Google Sheets: ${response.status} - ${response.statusText}`);
      }
      
      return response.json();
    } else {
      const response = await fetch(
        `${baseUrl}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error en la API de Google Sheets: ${response.status} - ${response.statusText}`);
      }
      
      return response.json();
    }
  }

  async findEmployeeByDocument(numeroDocumento: string): Promise<EmployeeData | null> {
    try {
      const response = await this.makeRequest('Empleados!A:L');
      const rows = response.values;
      
      if (!rows || rows.length <= 1) return null;
      
      // Buscar empleado por número de documento (columna C)
      const employeeRow = rows.find((row: string[], index: number) => 
        index > 0 && row[2] === numeroDocumento
      );
      
      if (!employeeRow) return null;
      
      return {
        id: employeeRow[0] || crypto.randomUUID(),
        tipo_documento: employeeRow[1] || 'CC',
        numero_documento: employeeRow[2],
        nombre: employeeRow[3],
        cargo: employeeRow[4],
        empresa: employeeRow[5],
        estado: employeeRow[6],
        sueldo: parseFloat(employeeRow[7]) || 0,
        fecha_ingreso: employeeRow[8],
        fecha_retiro: employeeRow[9] || undefined,
        tipo_contrato: employeeRow[10],
        correo: employeeRow[11]
      };
    } catch (error) {
      console.error('Error finding employee:', error);
      throw error;
    }
  }

  async saveCertificationHistory(certification: Omit<CertificationHistory, 'id'>): Promise<boolean> {
    try {
      const response = await this.makeRequest('Historial!A:H');
      const rows = response.values || [];
      const nextRow = rows.length + 1;
      
      const newRow = [
        crypto.randomUUID(),
        certification.empleado_id,
        certification.nombre_empleado,
        certification.numero_documento,
        certification.tipo_certificacion,
        certification.fecha_generacion,
        certification.generado_por,
        JSON.stringify(certification.detalles)
      ];
      
      await this.makeRequest(`Historial!A${nextRow}:H${nextRow}`, 'POST', [newRow]);
      return true;
    } catch (error) {
      console.error('Error saving certification history:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Empleados!A1:A1');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async createSampleData(): Promise<boolean> {
    try {
      // Crear headers para la hoja de Empleados
      const employeesHeaders = [
        ['ID', 'Tipo Documento', 'Número Documento', 'Nombre', 'Cargo', 'Empresa', 'Estado', 'Sueldo', 'Fecha Ingreso', 'Fecha Retiro', 'Tipo Contrato', 'Correo']
      ];
      
      // Datos de ejemplo para empleados
      const sampleEmployees = [
        ['1', 'CC', '1024532077', 'Juan Pérez García', 'Desarrollador Senior', 'VITY', 'ACTIVO', '4500000', '2023-01-15', '', 'INDEFINIDO', 'juan.perez@vity.com'],
        ['2', 'CC', '1098765432', 'María López Rodríguez', 'Analista de Recursos Humanos', 'VITY', 'ACTIVO', '3200000', '2023-03-20', '', 'INDEFINIDO', 'maria.lopez@vity.com'],
        ['3', 'CC', '1122334455', 'Carlos Martínez Silva', 'Gerente de Proyectos', 'VITY', 'RETIRADO', '5500000', '2022-06-10', '2024-10-30', 'INDEFINIDO', 'carlos.martinez@vity.com']
      ];

      // Crear headers para la hoja de Historial
      const historyHeaders = [
        ['ID', 'Empleado ID', 'Nombre Empleado', 'Número Documento', 'Tipo Certificación', 'Fecha Generación', 'Generado Por', 'Detalles']
      ];

      // Escribir datos a las hojas
      await this.makeRequest('Empleados!A1:L4', 'POST', [...employeesHeaders, ...sampleEmployees]);
      await this.makeRequest('Historial!A1:H1', 'POST', historyHeaders);

      return true;
    } catch (error) {
      console.error('Error creating sample data:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { EmployeeData, CertificationHistory };
