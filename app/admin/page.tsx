import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | Neuvesca",
  description: "Neuvesca admin area.",
};

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  return (
    <section className="pageIntro pageIntroCentered">
      <p className="eyebrow">Admin</p>
      <h1>Studio controls.</h1>
      <p className="lede">
        You are signed in as {user.email}. Role-specific admin tools will be
        added after the protected shell is in place.
      </p>
    </section>
  );
}
