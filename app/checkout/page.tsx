import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout | Neuvesca",
  description: "Checkout with Neuvesca.",
};

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  return (
    <section className="pageIntro pageIntroCentered">
      <p className="eyebrow">Checkout</p>
      <h1>Checkout is ready for the next step.</h1>
      <p className="lede">
        You are signed in as {user.email}. Cart and payment flow will land here
        in the next commerce task.
      </p>
    </section>
  );
}
