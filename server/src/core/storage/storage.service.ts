import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL')!;
    const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.client = createClient<any, 'public', 'public'>(
      supabaseUrl,
      supabaseKey,
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
