import { createClient } from "@/lib/supabase/server";
import SiteHeaderNav from "./SiteHeaderNav";

async function getCartCount(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);

  return (
    data?.reduce((total, item) => total + (Number(item.quantity) || 0), 0) ?? 0
  );
}

export default async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const cartCount = user ? await getCartCount(user.id) : 0;

  return <SiteHeaderNav cartCount={cartCount} isAuthenticated={Boolean(user)} />;
}
