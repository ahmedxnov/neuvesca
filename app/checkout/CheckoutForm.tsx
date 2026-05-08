"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { formatPrice } from "@/lib/format";
import type { ServerCartLine } from "@/lib/queries/cart";
import { readStoredPromo, type StoredPromo } from "@/lib/cart/promo";
import {
  createStripePaymentIntent,
  placeOrder,
  type StripeIntentResult,
} from "./actions";

type StripeElements = {
  create: (type: "payment") => {
    mount: (target: HTMLElement) => void;
  };
};

type StripeClient = {
  elements: (options: {
    clientSecret: string;
    appearance?: Record<string, unknown>;
  }) => StripeElements;
  confirmPayment: (options: {
    elements: StripeElements;
    confirmParams: { return_url: string };
    redirect: "if_required";
  }) => Promise<{
    error?: { message?: string };
    paymentIntent?: { status?: string };
  }>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeClient;
  }
}

let stripeScriptPromise: Promise<void> | null = null;

function loadStripeScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Stripe) return Promise.resolve();
  if (stripeScriptPromise) return stripeScriptPromise;

  stripeScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe.js could not load."));
    document.head.appendChild(script);
  });

  return stripeScriptPromise;
}

function CashSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button secondary mt-2" disabled={pending} type="submit">
      {pending ? "Placing order" : "Pay cash on delivery"}
    </button>
  );
}

export default function CheckoutForm({
  cart,
  currency,
  subtotalCents,
  userEmail,
  error,
}: {
  cart: ServerCartLine[];
  currency: string;
  subtotalCents: number;
  userEmail: string;
  error?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const stripeElementRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<StripeClient | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const [stripeResult, setStripeResult] = useState<StripeIntentResult | null>(
    null,
  );
  const [stripeOrderId, setStripeOrderId] = useState("");
  const [stripeMessage, setStripeMessage] = useState("");
  const [isStartingStripe, setIsStartingStripe] = useState(false);
  const [isConfirmingStripe, setIsConfirmingStripe] = useState(false);
  const [promo, setPromo] = useState<StoredPromo | null>(null);

  useEffect(() => {
    setPromo(readStoredPromo());
  }, []);

  const discountCents = promo
    ? Math.round((subtotalCents * promo.percent) / 100)
    : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents);

  async function startStripePayment() {
    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) return;

    setIsStartingStripe(true);
    setStripeMessage("");
    setStripeResult(null);

    try {
      const result = await createStripePaymentIntent(new FormData(form));
      setStripeResult(result);

      if (!result.ok) {
        setStripeMessage(result.error);
        return;
      }

      await loadStripeScript();
      if (!window.Stripe) {
        setStripeMessage("Stripe.js is unavailable.");
        return;
      }

      const stripe = window.Stripe(result.publishableKey);
      const elements = stripe.elements({
        clientSecret: result.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1f1a14",
            borderRadius: "2px",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        },
      });

      if (stripeElementRef.current) {
        stripeElementRef.current.innerHTML = "";
        elements.create("payment").mount(stripeElementRef.current);
      }

      stripeRef.current = stripe;
      elementsRef.current = elements;
      setStripeOrderId(result.orderId);
      setStripeMessage("Enter card details to complete payment.");
    } catch (loadError) {
      setStripeMessage(
        loadError instanceof Error
          ? loadError.message
          : "Stripe checkout could not start.",
      );
    } finally {
      setIsStartingStripe(false);
    }
  }

  async function confirmStripePayment() {
    if (!stripeRef.current || !elementsRef.current || !stripeOrderId) return;

    setIsConfirmingStripe(true);
    setStripeMessage("");

    const result = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${stripeOrderId}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setStripeMessage(result.error.message || "Payment could not be confirmed.");
      setIsConfirmingStripe(false);
      return;
    }

    if (
      result.paymentIntent?.status === "succeeded" ||
      result.paymentIntent?.status === "processing"
    ) {
      window.location.href = `/checkout/success?order=${stripeOrderId}`;
      return;
    }

    setStripeMessage("Payment is awaiting confirmation.");
    setIsConfirmingStripe(false);
  }

  return (
    <form
      action={placeOrder}
      className="authForm mt-8 grid gap-5 bg-[var(--porcelain)] p-[clamp(1.5rem,3vw,2.5rem)] shadow-[var(--shadow-soft)]"
      ref={formRef}
    >
      {error && <p className="authMessage authError">{error}</p>}

      <label>
        <span>Full name</span>
        <input name="customer_name" required type="text" />
      </label>
      <label>
        <span>Email</span>
        <input
          defaultValue={userEmail}
          name="customer_email"
          required
          type="email"
        />
      </label>
      <label>
        <span>Address line 1</span>
        <input name="shipping_address_line1" required type="text" />
      </label>
      <label>
        <span>Address line 2 (optional)</span>
        <input name="shipping_address_line2" type="text" />
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span>City</span>
          <input name="shipping_city" required type="text" />
        </label>
        <label>
          <span>Region (optional)</span>
          <input name="shipping_region" type="text" />
        </label>
        <label>
          <span>Postal code</span>
          <input name="shipping_postal_code" required type="text" />
        </label>
        <label>
          <span>Country</span>
          <input name="shipping_country" required type="text" />
        </label>
      </div>

      <div className="mt-2 grid gap-4 border-t border-[var(--line-soft)] pt-4">
        <div className="grid gap-2">
          <p className="eyebrow !mb-0">Payment</p>
          <p className="text-[var(--ink-soft)]">
            Choose card payment now or cash on delivery.
          </p>
          {promo && (
            <p className="text-[0.85rem] text-[var(--ink-soft)]">
              Promo <strong>{promo.code}</strong> applied — {promo.percent}% off (− {formatPrice(discountCents, currency)})
            </p>
          )}
          <p className="text-[0.85rem] text-[var(--muted)]">
            Total due: {formatPrice(totalCents, currency)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="button primary mt-2"
            disabled={isStartingStripe}
            onClick={startStripePayment}
            type="button"
          >
            {isStartingStripe ? "Starting Stripe" : "Pay by card"}
          </button>
          <CashSubmitButton />
        </div>

        <div
          className={`grid gap-4 ${
            stripeResult?.ok ? "border-t border-[var(--line-soft)] pt-4" : ""
          }`}
        >
          <div ref={stripeElementRef} />
          {stripeResult?.ok && (
            <button
              className="button primary"
              disabled={isConfirmingStripe}
              onClick={confirmStripePayment}
              type="button"
            >
              {isConfirmingStripe ? "Confirming" : "Confirm card payment"}
            </button>
          )}
          {stripeMessage && (
            <p className="authMessage" role="status">
              {stripeMessage}
            </p>
          )}
        </div>
      </div>

      <input
        name="cart_snapshot"
        readOnly
        type="hidden"
        value={cart.map((line) => `${line.productSlug}:${line.quantity}`).join("|")}
      />
      <input
        name="promo_code"
        readOnly
        type="hidden"
        value={promo?.code ?? ""}
      />
    </form>
  );
}
