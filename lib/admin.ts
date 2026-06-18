import { supabase } from "@/lib/supabase";

export async function isAdminUser(userId: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;

  return Boolean(data);
}
