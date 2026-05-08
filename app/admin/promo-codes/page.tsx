import { createClient } from "@/lib/supabase/server";
import PromoCodesAdminClient from "./PromoCodesAdminClient";

export default async function AdminPromoCodesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, discount_percent, starts_at, ends_at, max_uses, used_count, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <header className="adminPageHead">
        <div>
          <p className="eyebrow">Promo codes</p>
          <h1>Discount codes.</h1>
          <p>
            Create a code, set the percent off, and choose how long it lives.
            Customers paste it into the cart at checkout.
          </p>
        </div>
      </header>

      {error ? (
        <div className="adminCard adminToast">{error.message}</div>
      ) : (
        <PromoCodesAdminClient initialCodes={data ?? []} />
      )}
    </>
  );
}
