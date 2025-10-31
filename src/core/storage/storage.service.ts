import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

    if (!(supabaseUrl && supabaseKey)) {
      throw new Error(
        "Supabase URL và Service Role Key phải được cấu hình đúng trong biến môi trường."
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
