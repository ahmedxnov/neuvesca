import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | Neuvesca",
  description: "Neuvesca admin area.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <section className="min-h-[70vh] bg-[#f7f8f6] px-5 py-6 text-[#1b1f1d] sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1380px] gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit border border-[#d9ded7] bg-white p-4">
          <Link
            className="block border-b border-[#e7ebe5] pb-4 [font-family:var(--serif)] text-2xl italic"
            href="/admin"
          >
            neuvesca admin
          </Link>
          <nav aria-label="Admin navigation" className="mt-4 grid gap-1">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/products", label: "Products" },
              { href: "/admin/scents", label: "Scents" },
            ].map((link) => (
              <Link
                className="px-3 py-2 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#4b554f] hover:bg-[#eef2ec] hover:text-[#151816]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </section>
  );
}
