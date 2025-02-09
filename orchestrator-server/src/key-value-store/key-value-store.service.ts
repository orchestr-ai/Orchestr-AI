import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONSTANTS } from 'src/utils/constants';

@Injectable()
export class KeyValueStoreService {
  private supabase: SupabaseClient;
  private readonly tableName = 'key_value_store';

  constructor() {
    const SUPABASE_URL = CONSTANTS.SUPABSE_URL;
    const SUPABASE_KEY = CONSTANTS.SUPABASE_KEY;

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async set(key: string, value: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .upsert({ key, value });

    if (error) {
      throw new Error(`Error saving key-value pair: ${error.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Key not found
      throw new Error(`Error retrieving value: ${error.message}`);
    }

    return data?.value || null;
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`Error deleting key-value pair: ${error.message}`);
    }
  }

  async list(): Promise<{ key: string; value: string }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Error listing key-value pairs: ${error.message}`);
    }

    return data || [];
  }
}
