import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly configService: ConfigService;
  private readonly client: SupabaseClient;

  constructor(configService: ConfigService) {
    this.configService = configService;
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseServiceRoleKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY"
    );
    if (!(supabaseUrl && supabaseServiceRoleKey)) {
      throw new Error(
        "Supabase URL và Service Role Key không được cấu hình trong biến môi trường."
      );
    }
    this.client = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
