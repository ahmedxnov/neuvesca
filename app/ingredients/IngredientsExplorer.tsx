"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IngredientWithProducts } from "@/lib/queries/ingredients";

export default function IngredientsExplorer({
  ingredients,
}: {
  ingredients: IngredientWithProducts[];
}) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? ingredients.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.description?.toLowerCase().includes(q) ?? false) ||
            (i.safety_notes?.toLowerCase().includes(q) ?? false),
        )
      : ingredients;

    const map = new Map<string, IngredientWithProducts[]>();
    for (const ing of filtered) {
      const letter = ing.name.charAt(0).toUpperCase();
      const arr = map.get(letter) ?? [];
      arr.push(ing);
      map.set(letter, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [ingredients, query]);

  return (
    <div className="grid gap-10">
      <label className="grid gap-2">
        <span className="eyebrow !mb-0">Search ingredients</span>
        <input
          className="border-0 border-b border-[var(--line)] bg-transparent py-3 text-[1rem] focus:border-[var(--ink)] focus:outline-none"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “wax”, “wick”, or “oil”"
          type="search"
          value={query}
        />
      </label>

      {groups.length === 0 ? (
        <p className="text-[var(--muted)]">No ingredients match that search.</p>
      ) : (
        groups.map(([letter, items]) => (
          <section className="grid gap-5" key={letter}>
            <h2 className="!m-0 [font-family:var(--serif)] text-[2rem] italic text-[var(--clay)]">
              {letter}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {items.map((ing) => (
                <article
                  className="grid gap-3 border border-[var(--line)] bg-[var(--porcelain)] p-6"
                  id={ing.slug}
                  key={ing.id}
                >
                  <h3 className="!m-0 [font-family:var(--serif)] text-[1.55rem]">
                    {ing.name}
                  </h3>
                  {ing.description && (
                    <p className="text-[var(--ink-soft)]">{ing.description}</p>
                  )}
                  {ing.safety_notes && (
                    <p className="border-l-2 border-[var(--clay)] bg-[var(--cream)] p-3 text-[0.9rem] italic text-[var(--ink-soft)]">
                      <strong className="not-italic uppercase tracking-[0.24em] text-[0.65rem] text-[var(--muted)]">
                        Safety:
                      </strong>{" "}
                      {ing.safety_notes}
                    </p>
                  )}
                  {ing.products.length > 0 && (
                    <p className="text-[0.85rem] text-[var(--muted)]">
                      <span className="uppercase tracking-[0.24em] text-[0.65rem]">
                        Used in:
                      </span>{" "}
                      {ing.products.map((p, idx) => (
                        <span key={p.slug}>
                          <Link
                            className="border-b border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                            href={`/products/${p.slug}`}
                          >
                            {p.name}
                          </Link>
                          {idx < ing.products.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
