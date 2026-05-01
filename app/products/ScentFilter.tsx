"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

export type ScentOption = { slug: string; name: string };

export default function ScentFilter({ options }: { options: ScentOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("scent") ?? "";

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    if (e.target.value) next.set("scent", e.target.value);
    else next.delete("scent");
    router.push(`/products${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <label className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.26em] text-[var(--muted)]">
      <span>Filter by scent</span>
      <select
        className="cursor-pointer border-0 border-b border-[var(--line)] bg-transparent py-2 pr-6 font-[inherit] text-[0.78rem] tracking-[0.18em] text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
        onChange={onChange}
        value={current}
      >
        <option value="">All scents</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
