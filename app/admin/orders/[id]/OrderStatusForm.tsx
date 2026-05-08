"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function OrderStatusForm({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  async function save() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Status updated.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="adminButtonRow" style={{ alignItems: "center" }}>
      {message && (
        <span style={{ color: "var(--admin-muted)", fontSize: "0.78rem" }}>
          {message}
        </span>
      )}
      <select
        aria-label="Order status"
        className="adminSelect"
        onChange={(e) => setStatus(e.target.value)}
        style={{ width: "auto" }}
        value={status}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <button
        className="adminButton adminButtonPrimary"
        disabled={saving || status === initialStatus}
        onClick={save}
        type="button"
      >
        {saving ? "Saving…" : "Update status"}
      </button>
    </div>
  );
}
