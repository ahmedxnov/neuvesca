import { createClient } from "@/lib/supabase/server";
import { getServerCartCount } from "@/lib/queries/cart";
import SiteHeaderNav from "./SiteHeaderNav";

export default async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const initialCount = user ? await getServerCartCount(user.id) : 0;

  return (
    <SiteHeaderNav
      initialCount={initialCount}
      isAuthenticated={Boolean(user)}
    />
  );
}
