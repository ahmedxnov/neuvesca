import { createClient } from "@/lib/supabase/server";
import ScentsAdminClient, { type AdminScent } from "./ScentsAdminClient";

export default async function AdminScentsPage() {
  const supabase = createClient();
  const { data: scents } = await supabase
    .from("scents")
    .select("id, slug, name, description, family, is_active")
    .order("slug", { ascending: true });

  return <ScentsAdminClient initialScents={(scents ?? []) as AdminScent[]} />;
}
