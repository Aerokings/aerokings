import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getPhotoUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("maid-photos").getPublicUrl(path);
  return data?.publicUrl || null;
}
