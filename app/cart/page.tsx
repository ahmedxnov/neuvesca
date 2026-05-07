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
      <section className="cartEmpty">
        <p className="eyebrow">Cart</p>
        <h1>Loading your cart…</h1>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="cartEmpty">
        <p className="eyebrow">Cart</p>
        <h1>Your cart is quiet.</h1>
        <p className="lede">
          Choose a candle from the cabinet — it will rest here until you&rsquo;re
          ready.
        </p>
        <Link className="button primary mt-2 inline-flex" href="/products">
          Browse the cabinet
        </Link>
      </section>
    );
  }

  const currency = items[0]?.currency ?? "EUR";
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

  function onCheckout() {
    if (!isAuthenticated) {
      router.push("/login?next=/checkout");
      return;
    }
    router.push("/checkout");
  }

  return (
    <section className="cartLayout">
      <header>
        <p className="eyebrow">Your cart</p>
        <h1>
          {itemCount === 1 ? "One candle" : `${itemCount} candles`} ready.
        </h1>
      </header>

      <ul className="cartLines">
        {items.map((line) => (
          <li className="cartLine" key={line.id}>
            <Link
              className="cartLineThumb"
              href={`/products/${line.productSlug}`}
            >
              {line.productImageUrl ? (
                <Image
                  alt={line.productName}
                  fill
                  sizes="110px"
                  src={line.productImageUrl}
                />
              ) : (
                <span className="grid h-full w-full place-items-center [font-family:var(--serif)] text-[0.7rem] italic">
                  neuvesca
                </span>
              )}
            </Link>

            <div className="cartLineMeta">
              <Link
                className="cartLineName"
                href={`/products/${line.productSlug}`}
              >
                {line.productName}
              </Link>
              <span className="cartLineScent">
                <span
                  aria-hidden
                  className="swatch"
                  style={{ background: scentSwatchColor(line.scentSlug) }}
                />
                {line.scentName}
              </span>
              <div className="cartLineActions">
                <div className="qtyStepper">
                  <button
                    aria-label="Decrease quantity"
                    disabled={line.quantity <= 1}
                    onClick={() => updateQty(line.id, line.quantity - 1)}
                    type="button"
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    disabled={line.quantity >= 99}
                    onClick={() => updateQty(line.id, line.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button
                  className="cartRemove"
                  onClick={() => removeItem(line.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <span className="cartLinePrice">
              {formatPrice(line.quantity * line.unitPriceCents, line.currency)}
            </span>
          </li>
        ))}
      </ul>

      <aside className="cartSummary" aria-label="Order summary">
        <h3>Order summary</h3>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotalCents, currency)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="cartTotal">
            <dt>Total</dt>
            <dd>{formatPrice(subtotalCents, currency)}</dd>
          </div>
        </dl>
        <p>Tax included where applicable. Free shipping on orders over €60.</p>
        <button
          className="button primary full"
          onClick={onCheckout}
          type="button"
        >
          Proceed to checkout
        </button>
        <Link className="tertiary mx-auto" href="/products">
          Continue shopping
        </Link>
      </aside>
    </section>
  );
}
