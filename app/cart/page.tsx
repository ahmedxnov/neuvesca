"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartProvider";
import { formatPrice, scentSwatchColor } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    subtotalCents,
    isAuthenticated,
    isLoading,
    updateQty,
    removeItem,
  } = useCart();

  if (isLoading) {
    return (
      <section className="pageIntro pageIntroCentered">
        <p className="eyebrow">Cart</p>
        <h1>Loading your cart…</h1>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="pageIntro pageIntroCentered">
        <p className="eyebrow">Cart</p>
        <h1>Your cart is quiet.</h1>
        <p className="lede">
          Choose a candle from the cabinet — it will rest here until you&rsquo;re
          ready.
        </p>
        <Link className="button primary mt-8 inline-flex" href="/products">
          Browse the cabinet
        </Link>
      </section>
    );
  }

  const currency = items[0]?.currency ?? "EUR";

  function onCheckout() {
    if (!isAuthenticated) {
      router.push("/login?next=/checkout");
      return;
    }
    router.push("/checkout");
  }

  return (
    <section className="mx-auto grid max-w-[1080px] gap-10 px-[clamp(1.25rem,5vw,5.5rem)] py-[clamp(3rem,6vw,6rem)]">
      <header>
        <p className="eyebrow">Your cart</p>
        <h1>{items.length === 1 ? "One scent" : `${items.length} scents`} ready.</h1>
      </header>

      <ul className="grid divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
        {items.map((line) => (
          <li
            className="grid grid-cols-[88px_1fr_auto] items-center gap-5 py-6"
            key={line.id}
          >
            <Link
              className={`relative aspect-square overflow-hidden bg-[var(--cream)] ${line.productTone ?? ""}`}
              href={`/products/${line.productSlug}`}
            >
              {line.productImageUrl ? (
                <Image
                  alt={line.productName}
                  className="object-cover"
                  fill
                  sizes="88px"
                  src={line.productImageUrl}
                />
              ) : (
                <span className="grid h-full w-full place-items-center [font-family:var(--serif)] text-[0.7rem] italic">
                  neuvesca
                </span>
              )}
            </Link>

            <div className="grid gap-1.5">
              <Link
                className="[font-family:var(--serif)] text-[1.25rem] hover:text-[var(--clay)]"
                href={`/products/${line.productSlug}`}
              >
                {line.productName}
              </Link>
              <span className="inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--line)]"
                  style={{ background: scentSwatchColor(line.scentSlug) }}
                />
                {line.scentName}
              </span>
              <div className="mt-2 inline-flex items-center gap-3">
                <div className="inline-flex items-center border border-[var(--line)]">
                  <button
                    aria-label="Decrease quantity"
                    className="px-3 py-1 text-[var(--ink-soft)] disabled:opacity-40"
                    disabled={line.quantity <= 1}
                    onClick={() => updateQty(line.id, line.quantity - 1)}
                    type="button"
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-[0.95rem]">
                    {line.quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    className="px-3 py-1 text-[var(--ink-soft)] disabled:opacity-40"
                    disabled={line.quantity >= 99}
                    onClick={() => updateQty(line.id, line.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
                  onClick={() => removeItem(line.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <span className="self-start [font-family:var(--serif)] text-[1.2rem] italic">
              {formatPrice(line.quantity * line.unitPriceCents, line.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid justify-end gap-4 text-right">
        <div className="flex items-baseline justify-end gap-6">
          <span className="eyebrow !mb-0">Subtotal</span>
          <span className="[font-family:var(--serif)] text-[2rem] italic">
            {formatPrice(subtotalCents, currency)}
          </span>
        </div>
        <p className="text-[0.85rem] text-[var(--muted)]">
          Shipping and tax calculated at checkout.
        </p>
        <button className="button primary justify-self-end" onClick={onCheckout} type="button">
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
