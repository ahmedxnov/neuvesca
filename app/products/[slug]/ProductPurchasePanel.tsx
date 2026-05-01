"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartProvider";
import { scentSwatchColor } from "@/lib/format";
import type { ScentRow } from "@/lib/queries/products";

type Props = {
  productId: string;
  primaryScents: ScentRow[];
  priceLabel: string;
};

export default function ProductPurchasePanel({
  productId,
  primaryScents,
  priceLabel,
}: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [scentId, setScentId] = useState<string | null>(
    primaryScents.length === 1 ? primaryScents[0].id : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const canAdd = Boolean(scentId) && !adding && !isPending;

  async function onAdd() {
    if (!scentId) return;
    setAdding(true);
    setAdded(false);
    try {
      await addToCart(productId, scentId, quantity);
      setAdded(true);
      startTransition(() => router.refresh());
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-3">
        <legend className="eyebrow !mb-0">Select your scent</legend>
        <div className="flex flex-wrap gap-2">
          {primaryScents.map((s) => {
            const selected = scentId === s.id;
            return (
              <button
                aria-pressed={selected}
                className={[
                  "inline-flex items-center gap-2 border px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] transition-colors",
                  selected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--cream)]"
                    : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]",
                ].join(" ")}
                key={s.id}
                onClick={() => setScentId(s.id)}
                type="button"
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--line)]"
                  style={{ background: scentSwatchColor(s.slug) }}
                />
                {s.name}
              </button>
            );
          })}
        </div>
        {!scentId && (
          <p className="text-[0.85rem] italic text-[var(--muted)]">
            Pick a scent to enable add to cart.
          </p>
        )}
      </fieldset>

      <div className="flex items-center gap-4">
        <span className="eyebrow !mb-0">Quantity</span>
        <div className="inline-flex items-center border border-[var(--line)]">
          <button
            aria-label="Decrease quantity"
            className="px-3 py-2 text-[var(--ink-soft)] disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            type="button"
          >
            −
          </button>
          <span className="min-w-8 text-center text-[0.95rem]">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="px-3 py-2 text-[var(--ink-soft)] disabled:opacity-40"
            disabled={quantity >= 10}
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--line-soft)] pt-5">
        <span className="[font-family:var(--serif)] text-[1.6rem] italic">
          {priceLabel}
        </span>
        <button
          className="button primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canAdd}
          onClick={onAdd}
          type="button"
        >
          {adding ? "Adding…" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
