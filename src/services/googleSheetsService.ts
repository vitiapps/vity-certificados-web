
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
  private SPREADSHEET_ID = '1YourSpreadsheetIdHere'; // El usuario necesitará reemplazar esto
  private API_KEY = 'AIzaSyYourGoogleSheetsAPIKey'; // El usuario necesitará configurar esto
  
  private async makeRequest(range: string, method: 'GET' | 'POST' = 'GET', values?: any[][]) {
    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}`;
    
    if (method === 'GET') {
      const response = await fetch(
        `${baseUrl}/values/${range}?key=${this.API_KEY}`
      );
      return response.json();
    } else {
      const response = await fetch(
        `${baseUrl}/values/${range}?valueInputOption=RAW&key=${this.API_KEY}`,
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
      return null;
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
      return false;
    }
  }

  // Método para verificar la conexión
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Empleados!A1:A1');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { EmployeeData, CertificationHistory };
