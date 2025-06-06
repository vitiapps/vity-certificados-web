
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
  private spreadsheetId: string = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  private apiKey: string = 'AIzaSyBIiQCYaJX1D2gNFGSQlWXro45eyjN9F0o';
  
  constructor() {
    // Auto-configurar las credenciales
    this.loadCredentials();
  }
  
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
    
    // Si no hay credenciales guardadas, usar las por defecto
    if (!savedSpreadsheetId || !savedApiKey) {
      localStorage.setItem('googleSheets_spreadsheetId', this.spreadsheetId);
      localStorage.setItem('googleSheets_apiKey', this.apiKey);
    }
    
    return true;
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
      // Para escribir datos, necesitamos usar un método diferente ya que esta API key es de solo lectura
      throw new Error('Permisos de escritura no disponibles con la API key actual');
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
      // Por ahora, solo simular el guardado ya que no tenemos permisos de escritura
      console.log('Certification history would be saved:', certification);
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
    // Como no tenemos permisos de escritura, vamos a lanzar un error informativo
    throw new Error('Para crear datos de ejemplo, necesitas agregar manualmente los datos a tu hoja de Google Sheets o usar una API key con permisos de escritura.');
  }

  // Método para obtener los datos de ejemplo que el usuario debe agregar manualmente
  getSampleDataInstructions() {
    return {
      employeesHeaders: ['ID', 'Tipo Documento', 'Número Documento', 'Nombre', 'Cargo', 'Empresa', 'Estado', 'Sueldo', 'Fecha Ingreso', 'Fecha Retiro', 'Tipo Contrato', 'Correo'],
      sampleEmployees: [
        ['1', 'CC', '1024532077', 'Juan Pérez García', 'Desarrollador Senior', 'VITY', 'ACTIVO', '4500000', '2023-01-15', '', 'INDEFINIDO', 'juan.perez@vity.com'],
        ['2', 'CC', '1098765432', 'María López Rodríguez', 'Analista de Recursos Humanos', 'VITY', 'ACTIVO', '3200000', '2023-03-20', '', 'INDEFINIDO', 'maria.lopez@vity.com'],
        ['3', 'CC', '1122334455', 'Carlos Martínez Silva', 'Gerente de Proyectos', 'VITY', 'RETIRADO', '5500000', '2022-06-10', '2024-10-30', 'INDEFINIDO', 'carlos.martinez@vity.com'],
        ['4', 'CC', '1234567890', 'Ana Rodríguez Torres', 'Diseñadora UX/UI', 'VITY', 'ACTIVO', '3800000', '2023-05-12', '', 'INDEFINIDO', 'ana.rodriguez@vity.com'],
        ['5', 'CC', '9876543210', 'Luis Gómez Vargas', 'Contador Senior', 'VITY', 'ACTIVO', '4200000', '2022-09-01', '', 'INDEFINIDO', 'luis.gomez@vity.com']
      ],
      historyHeaders: ['ID', 'Empleado ID', 'Nombre Empleado', 'Número Documento', 'Tipo Certificación', 'Fecha Generación', 'Generado Por', 'Detalles']
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { EmployeeData, CertificationHistory };
