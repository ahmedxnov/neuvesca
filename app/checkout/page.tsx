import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerCart } from "@/lib/queries/cart";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "./actions";

export const metadata: Metadata = {
  title: "Checkout | Neuvesca",
  description: "Complete your Neuvesca order.",
};

type SearchParams = { error?: string };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const cart = await getServerCart(user.id);
  if (cart.length === 0) redirect("/cart");

  const currency = cart[0].currency;
  const subtotalCents = cart.reduce(
    (n, l) => n + l.quantity * l.unitPriceCents,
    0,
  );

  return (
    <section className="mx-auto grid max-w-[1080px] gap-10 px-[clamp(1.25rem,5vw,5.5rem)] py-[clamp(3rem,6vw,6rem)] lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="eyebrow">Checkout</p>
        <h1 className="!text-[clamp(2.4rem,4vw,3.6rem)]">Shipping &amp; payment.</h1>
        <p className="lede">
          Payment is on delivery (cash) for now — confirm the address below and
          we&rsquo;ll get the pour boxed.
        </p>

        {searchParams?.error && (
          <p className="authMessage authError mt-6">{searchParams.error}</p>
        )}

        <form
          action={placeOrder}
          className="authForm mt-8 grid gap-5 bg-[var(--porcelain)] p-[clamp(1.5rem,3vw,2.5rem)] shadow-[var(--shadow-soft)]"
        >
          <label>
            <span>Full name</span>
            <input name="customer_name" required type="text" />
          </label>
          <label>
            <span>Email</span>
            <input
              defaultValue={user.email ?? ""}
              name="customer_email"
              required
              type="email"
            />
          </label>
          <label>
            <span>Address line 1</span>
            <input name="shipping_address_line1" required type="text" />
          </label>
          <label>
            <span>Address line 2 (optional)</span>
            <input name="shipping_address_line2" type="text" />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span>City</span>
              <input name="shipping_city" required type="text" />
            </label>
            <label>
              <span>Region (optional)</span>
              <input name="shipping_region" type="text" />
            </label>
            <label>
              <span>Postal code</span>
              <input name="shipping_postal_code" required type="text" />
            </label>
            <label>
              <span>Country</span>
              <input name="shipping_country" required type="text" />
            </label>
          </div>

          <div className="mt-2 grid gap-2 border-t border-[var(--line-soft)] pt-4">
            <p className="eyebrow !mb-0">Payment</p>
            <p className="text-[var(--ink-soft)]">
              Cash on delivery — pay when your candles arrive.
            </p>
          </div>

          <button className="button primary mt-2" type="submit">
            Place order
          </button>
        </form>
      </div>

      <aside className="grid h-fit gap-5 border border-[var(--line)] bg-[var(--cream)] p-[clamp(1.5rem,3vw,2.5rem)]">
        <p className="eyebrow !mb-0">Order summary</p>
        <ul className="grid gap-4">
          {cart.map((line) => (
            <li
              className="flex items-start justify-between gap-4 border-b border-[var(--line-soft)] pb-4 last:border-b-0 last:pb-0"
              key={line.id}
            >
              <div className="grid gap-1">
                <span className="[font-family:var(--serif)] text-[1.05rem] italic">
                  {line.productName}
                </span>
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {line.scentName} · ×{line.quantity}
                </span>
              </div>
              <span className="[font-family:var(--serif)] text-[1.05rem] italic">
                {formatPrice(line.quantity * line.unitPriceCents, line.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 border-t border-[var(--line-soft)] pt-4">
          <div className="flex items-baseline justify-between text-[var(--muted)]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents, currency)}</span>
          </div>
          <div className="flex items-baseline justify-between text-[var(--muted)]">
            <span>Shipping</span>
            <span>Calculated on delivery</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-[var(--line)] pt-3">
            <span className="eyebrow !mb-0">Total</span>
            <span className="[font-family:var(--serif)] text-[1.6rem] italic">
              {formatPrice(subtotalCents, currency)}
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
