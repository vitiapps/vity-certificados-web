
import { supabase } from '@/integrations/supabase/client';

export interface CompanyCertificateConfig {
  id: string;
  companyName: string;
  logoUrl?: string;
  nit: string;
  city: string;
  signatories: {
    name: string;
    position: string;
    signature?: string;
  }[];
  customText?: string;
  headerColor: string;
  footerText?: string;
}

interface CompanyConfigRow {
  id: string;
  company_name: string;
  nit: string;
  city: string;
  logo_base64: string | null;
  header_color: string;
  footer_text: string | null;
  signatories: any;
  created_at: string;
  updated_at: string;
}

class CompanyConfigService {
  // Convertir de formato de DB a formato de interfaz
  private mapFromDb(row: CompanyConfigRow): CompanyCertificateConfig {
    return {
      id: row.id,
      companyName: row.company_name,
      nit: row.nit,
      city: row.city,
      logoUrl: row.logo_base64 || undefined,
      headerColor: row.header_color,
      footerText: row.footer_text || undefined,
      signatories: Array.isArray(row.signatories) ? row.signatories : []
    };
  }

  // Convertir de formato de interfaz a formato de DB
  private mapToDb(config: Omit<CompanyCertificateConfig, 'id'>): Omit<CompanyConfigRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      company_name: config.companyName,
      nit: config.nit,
      city: config.city,
      logo_base64: config.logoUrl || null,
      header_color: config.headerColor,
      footer_text: config.footerText || null,
      signatories: config.signatories
    };
  }

  async getAllConfigs(): Promise<CompanyCertificateConfig[]> {
    try {
      const { data, error } = await supabase
        .from('company_certificate_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company configs:', error);
        throw error;
      }

      return (data || []).map(row => this.mapFromDb(row));
    } catch (error) {
      console.error('Error in getAllConfigs:', error);
      throw error;
    }
  }

  async getConfigById(id: string): Promise<CompanyCertificateConfig | null> {
    try {
      const { data, error } = await supabase
        .from('company_certificate_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapFromDb(data);
    } catch (error) {
      console.error('Error in getConfigById:', error);
      throw error;
    }
  }

  async createConfig(config: Omit<CompanyCertificateConfig, 'id'>): Promise<CompanyCertificateConfig> {
    try {
      const dbData = this.mapToDb(config);
      
      const { data, error } = await supabase
        .from('company_certificate_configs')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company config:', error);
        throw error;
      }

      return this.mapFromDb(data);
    } catch (error) {
      console.error('Error in createConfig:', error);
      throw error;
    }
  }

  async updateConfig(id: string, config: Omit<CompanyCertificateConfig, 'id'>): Promise<CompanyCertificateConfig> {
    try {
      const dbData = this.mapToDb(config);
      
      const { data, error } = await supabase
        .from('company_certificate_configs')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company config:', error);
        throw error;
      }

      return this.mapFromDb(data);
    } catch (error) {
      console.error('Error in updateConfig:', error);
      throw error;
    }
  }

  async deleteConfig(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_certificate_configs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company config:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteConfig:', error);
      throw error;
    }
  }

  // Migrar datos de localStorage a la base de datos
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const localData = localStorage.getItem('certificate_company_configs');
      if (!localData) return;

      const configs: CompanyCertificateConfig[] = JSON.parse(localData);
      console.log('Migrando configuraciones desde localStorage:', configs);

      for (const config of configs) {
        // Verificar si ya existe en la base de datos
        const existingConfigs = await this.getAllConfigs();
        const exists = existingConfigs.some(existing => 
          existing.companyName.toLowerCase() === config.companyName.toLowerCase()
        );

        if (!exists) {
          const { id, ...configData } = config;
          await this.createConfig(configData);
          console.log(`Migrada configuración: ${config.companyName}`);
        }
      }

      // Opcional: limpiar localStorage después de la migración
      // localStorage.removeItem('certificate_company_configs');
    } catch (error) {
      console.error('Error en migración desde localStorage:', error);
    }
  }
}

export const companyConfigService = new CompanyConfigService();
