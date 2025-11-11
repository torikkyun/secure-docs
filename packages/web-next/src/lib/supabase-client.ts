import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!(supabaseUrl && supabaseAnonKey)) {
  throw new Error(
    "Supabase URL và Anon Key không được cấu hình trong biến môi trường."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
