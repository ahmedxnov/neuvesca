import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.105.1";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20",
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const supabase = createClient(supabaseUrl, serviceRoleKey);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.user_id;
  const orderId = paymentIntent.metadata?.order_id;

  if (!userId || !orderId) {
    console.warn("PaymentIntent missing order metadata", paymentIntent.id);
    return;
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: "stripe",
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (orderError) {
    throw orderError;
  }

  const { error: cartError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (cartError) {
    throw cartError;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const signature = request.headers.get("Stripe-Signature");
  if (!signature) {
    return json({ error: "Missing Stripe signature" }, 400);
  }

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return json({ error: "Webhook environment is not configured" }, 500);
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe signature";
    return json({ error: message }, 400);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    console.error(message);
    return json({ error: message }, 500);
  }

  return json({ received: true });
});
