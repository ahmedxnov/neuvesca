"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type ScentOption = { slug: string; name: string };

export default function ScentFilter({ options }: { options: ScentOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("scent") ?? "";

  function setScent(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("scent", value);
    else next.delete("scent");
    router.push(`/products${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <div
      aria-label="Filter by scent"
      className="scentChips"
      role="group"
    >
      <button
        aria-pressed={current === ""}
        className={`scentChip${current === "" ? " active" : ""}`}
        onClick={() => setScent("")}
        type="button"
      >
        All
      </button>
      {options.map((o) => (
        <button
          aria-pressed={current === o.slug}
          className={`scentChip${current === o.slug ? " active" : ""}`}
          key={o.slug}
          onClick={() => setScent(o.slug)}
          type="button"
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}
