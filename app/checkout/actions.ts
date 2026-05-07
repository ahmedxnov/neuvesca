"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerCart, type ServerCartLine } from "@/lib/queries/cart";

type CheckoutDetails = {
  customer_name: string;
  customer_email: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_region: string;
  shipping_postal_code: string;
  shipping_country: string;
};

type CheckoutTotals = {
  cart: ServerCartLine[];
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

type OrderPaymentMethod = "cash_on_delivery" | "stripe";

export type StripeIntentResult =
  | {
      ok: true;
      clientSecret: string;
      orderId: string;
      publishableKey: string;
    }
  | { ok: false; error: string };

function getString(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function back(error: string) {
  redirect(`/checkout?error=${encodeURIComponent(error)}`);
}

function readCheckoutDetails(
  formData: FormData,
  fallbackEmail: string,
): CheckoutDetails {
  return {
    customer_name: getString(formData, "customer_name"),
    customer_email: getString(formData, "customer_email") || fallbackEmail,
    shipping_address_line1: getString(formData, "shipping_address_line1"),
    shipping_address_line2: getString(formData, "shipping_address_line2"),
    shipping_city: getString(formData, "shipping_city"),
    shipping_region: getString(formData, "shipping_region"),
    shipping_postal_code: getString(formData, "shipping_postal_code"),
    shipping_country: getString(formData, "shipping_country"),
  };
}

function validateCheckoutDetails(details: CheckoutDetails) {
  if (
    !details.customer_name ||
    !details.shipping_address_line1 ||
    !details.shipping_city ||
    !details.shipping_postal_code ||
    !details.shipping_country
  ) {
    return "Please complete every required shipping field.";
  }

  return null;
}

async function getCheckoutTotals(userId: string): Promise<CheckoutTotals> {
  const cart = await getServerCart(userId);
  if (cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const currency = cart[0].currency;
  const subtotalCents = cart.reduce(
    (n, l) => n + l.quantity * l.unitPriceCents,
    0,
  );
  const shippingCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    cart,
    currency,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
  };
}

async function insertOrderWithItems({
  supabase,
  userId,
  details,
  totals,
  paymentMethod,
  orderId,
  stripePaymentIntentId,
}: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  details: CheckoutDetails;
  totals: CheckoutTotals;
  paymentMethod: OrderPaymentMethod;
  orderId?: string;
  stripePaymentIntentId?: string;
}) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      ...(orderId ? { id: orderId } : {}),
      user_id: userId,
      status: "pending",
      payment_method: paymentMethod,
      ...(stripePaymentIntentId
        ? { stripe_payment_intent_id: stripePaymentIntentId }
        : {}),
      subtotal_cents: totals.subtotalCents,
      shipping_cents: totals.shippingCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      currency: totals.currency,
      customer_email: details.customer_email,
      customer_name: details.customer_name,
      shipping_name: details.customer_name,
      shipping_address_line1: details.shipping_address_line1,
      shipping_address_line2: details.shipping_address_line2 || null,
      shipping_city: details.shipping_city,
      shipping_region: details.shipping_region || null,
      shipping_postal_code: details.shipping_postal_code,
      shipping_country: details.shipping_country,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "We couldn't place your order.");
  }

  const items = totals.cart.map((l) => ({
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
    throw new Error(itemsError.message || "We couldn't save your order items.");
  }

  return order.id;
}

function compactCartMetadata(cart: ServerCartLine[]) {
  return cart
    .map((line) => `${line.productSlug}:${line.scentSlug}:${line.quantity}`)
    .join("|")
    .slice(0, 450);
}

async function createStripeIntent({
  secretKey,
  orderId,
  userId,
  details,
  totals,
}: {
  secretKey: string;
  orderId: string;
  userId: string;
  details: CheckoutDetails;
  totals: CheckoutTotals;
}) {
  const body = new URLSearchParams();
  body.set("amount", String(totals.totalCents));
  body.set("currency", totals.currency.toLowerCase());
  body.set("automatic_payment_methods[enabled]", "true");
  body.set("receipt_email", details.customer_email);
  body.set("metadata[user_id]", userId);
  body.set("metadata[order_id]", orderId);
  body.set("metadata[cart]", compactCartMetadata(totals.cart));

  const countryCode = details.shipping_country.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(countryCode)) {
    body.set("shipping[name]", details.customer_name);
    body.set("shipping[address][line1]", details.shipping_address_line1);
    if (details.shipping_address_line2) {
      body.set("shipping[address][line2]", details.shipping_address_line2);
    }
    body.set("shipping[address][city]", details.shipping_city);
    if (details.shipping_region) {
      body.set("shipping[address][state]", details.shipping_region);
    }
    body.set("shipping[address][postal_code]", details.shipping_postal_code);
    body.set("shipping[address][country]", countryCode);
  }

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `order-${orderId}`,
    },
    body,
  });

  const payload = (await response.json()) as {
    id?: string;
    client_secret?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.id || !payload.client_secret) {
    throw new Error(
      payload.error?.message || "Stripe could not create the payment.",
    );
  }

  return {
    id: payload.id,
    clientSecret: payload.client_secret,
  };
}

async function cancelStripeIntent(secretKey: string, paymentIntentId: string) {
  await fetch(
    `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  ).catch(() => undefined);
}

export async function placeOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const details = readCheckoutDetails(formData, user.email || "");
  const validationError = validateCheckoutDetails(details);
  if (validationError) back(validationError);

  let orderId = "";
  try {
    const totals = await getCheckoutTotals(user.id);
    orderId = await insertOrderWithItems({
      supabase,
      userId: user.id,
      details,
      totals,
      paymentMethod: "cash_on_delivery",
    });
  } catch {
    back("We couldn't place your order. Please try again.");
  }

  // Empty the cart now that the order is recorded.
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  redirect(`/checkout/success?order=${orderId}`);
}

export async function createStripePaymentIntent(
  formData: FormData,
): Promise<StripeIntentResult> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    return {
      ok: false,
      error:
        "Stripe is not configured yet. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in before paying with Stripe." };
  }

  const details = readCheckoutDetails(formData, user.email || "");
  const validationError = validateCheckoutDetails(details);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const orderId = crypto.randomUUID();
  let paymentIntentId = "";

  try {
    const totals = await getCheckoutTotals(user.id);
    const paymentIntent = await createStripeIntent({
      secretKey,
      orderId,
      userId: user.id,
      details,
      totals,
    });
    paymentIntentId = paymentIntent.id;

    await insertOrderWithItems({
      supabase,
      userId: user.id,
      details,
      totals,
      paymentMethod: "stripe",
      orderId,
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      ok: true,
      clientSecret: paymentIntent.clientSecret,
      orderId,
      publishableKey,
    };
  } catch (error) {
    if (paymentIntentId) {
      await cancelStripeIntent(secretKey, paymentIntentId);
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Stripe checkout could not start.",
    };
  }
}
