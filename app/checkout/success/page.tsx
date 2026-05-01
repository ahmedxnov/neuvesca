import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import RefreshCartOnMount from "./RefreshCartOnMount";

export const metadata: Metadata = {
  title: "Order placed | Neuvesca",
  description: "Your Neuvesca order has been received.",
};

type SearchParams = { order?: string };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const orderId = searchParams?.order;
  if (!orderId) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, total_cents, currency, customer_name, shipping_address_line1, shipping_city, shipping_postal_code, shipping_country",
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <section className="pageIntro pageIntroCentered">
      <RefreshCartOnMount />
      <p className="eyebrow">Order received</p>
      <h1>Thank you, {order.customer_name?.split(" ")[0] ?? "friend"}.</h1>
      <p className="lede">
        Your candles are being prepared. You&rsquo;ll pay{" "}
        <strong>{formatPrice(order.total_cents, order.currency)}</strong> on
        delivery to:
      </p>
      <p className="[font-family:var(--serif)] text-[1.15rem] italic text-[var(--ink-soft)]">
        {order.shipping_address_line1}, {order.shipping_city}{" "}
        {order.shipping_postal_code}, {order.shipping_country}
      </p>
      <p className="mt-4 text-[0.78rem] uppercase tracking-[0.24em] text-[var(--muted)]">
        Order #{order.id.slice(0, 8)}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="button primary" href="/products">
          Back to the cabinet
        </Link>
        <Link className="button secondary" href="/account">
          View account
        </Link>
      </div>
    </section>
  );
}
