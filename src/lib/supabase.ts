import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getPhotoUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("maid-photos").getPublicUrl(path);
  return data?.publicUrl || null;
}
