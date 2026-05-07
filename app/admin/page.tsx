import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();
  const [{ count: productsCount }, { count: scentsCount }, { count: ordersCount }] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("scents").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

  return (
    <div className="grid gap-6">
      <header className="border border-[#d9ded7] bg-white p-6">
        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#6b756f]">
          Admin
        </p>
        <h1 className="!mb-0 !max-w-none !text-[clamp(2rem,4vw,3.4rem)]">
          Studio controls.
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Products", value: productsCount ?? 0, href: "/admin/products" },
          { label: "Scents", value: scentsCount ?? 0, href: "/admin/scents" },
          { label: "Orders", value: ordersCount ?? 0, href: null },
        ].map((item) => (
          <article className="border border-[#d9ded7] bg-white p-5" key={item.label}>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#6b756f]">
              {item.label}
            </span>
            <strong className="mt-3 block text-4xl font-semibold">
              {item.value}
            </strong>
            {item.href ? (
              <Link
                className="mt-5 inline-flex border border-[#151816] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] hover:bg-[#151816] hover:text-white"
                href={item.href}
              >
                Manage
              </Link>
            ) : (
              <p className="mt-5 text-sm text-[#69746d]">Screen not built yet.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
