"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerCart } from "@/lib/queries/cart";

function getString(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function back(error: string) {
  redirect(`/checkout?error=${encodeURIComponent(error)}`);
}

export async function placeOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const customer_name = getString(formData, "customer_name");
  const customer_email = getString(formData, "customer_email") || user.email || "";
  const shipping_address_line1 = getString(formData, "shipping_address_line1");
  const shipping_address_line2 = getString(formData, "shipping_address_line2");
  const shipping_city = getString(formData, "shipping_city");
  const shipping_region = getString(formData, "shipping_region");
  const shipping_postal_code = getString(formData, "shipping_postal_code");
  const shipping_country = getString(formData, "shipping_country");

  if (
    !customer_name ||
    !shipping_address_line1 ||
    !shipping_city ||
    !shipping_postal_code ||
    !shipping_country
  ) {
    back("Please complete every required shipping field.");
  }

  // Recompute totals server-side from the persisted cart.
  const cart = await getServerCart(user.id);
  if (cart.length === 0) {
    redirect("/cart");
  }

  const currency = cart[0].currency;
  const subtotalCents = cart.reduce(
    (n, l) => n + l.quantity * l.unitPriceCents,
    0,
  );
  const shippingCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_method: "cash_on_delivery",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      currency,
      customer_email,
      customer_name,
      shipping_name: customer_name,
      shipping_address_line1,
      shipping_address_line2: shipping_address_line2 || null,
      shipping_city,
      shipping_region: shipping_region || null,
      shipping_postal_code,
      shipping_country,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    back("We couldn't place your order. Please try again.");
  }

  const items = cart.map((l) => ({
    order_id: order!.id,
    product_id: l.productId,
    product_slug: l.productSlug,
    product_name: l.productName,
    product_family: l.productFamily,
    quantity: l.quantity,
    unit_price_cents: l.unitPriceCents,
    total_price_cents: l.quantity * l.unitPriceCents,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items);

  if (itemsError) {
    back("We couldn't save your order items. Please try again.");
  }

  // Empty the cart now that the order is recorded.
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  redirect(`/checkout/success?order=${order!.id}`);
}
