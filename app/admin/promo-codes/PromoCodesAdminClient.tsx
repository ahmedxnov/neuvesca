"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PromoCode = {
  id: string;
  code: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

type Form = {
  code: string;
  discount_percent: string;
  starts_at: string;
  ends_at: string;
  max_uses: string;
  is_active: boolean;
};

function blankForm(): Form {
  const today = new Date().toISOString().slice(0, 10);
  return {
    code: "",
    discount_percent: "10",
    starts_at: today,
    ends_at: "",
    max_uses: "",
    is_active: true,
  };
}

function toForm(c: PromoCode): Form {
  return {
    code: c.code,
    discount_percent: String(c.discount_percent),
    starts_at: c.starts_at ? c.starts_at.slice(0, 10) : "",
    ends_at: c.ends_at ? c.ends_at.slice(0, 10) : "",
    max_uses: c.max_uses != null ? String(c.max_uses) : "",
    is_active: c.is_active,
  };
}

function toIso(date: string): string | null {
  if (!date) return null;
  return new Date(date + "T00:00:00Z").toISOString();
}

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(c: PromoCode) {
  if (!c.ends_at) return false;
  return new Date(c.ends_at).getTime() < Date.now();
}

export default function PromoCodesAdminClient({
  initialCodes,
}: {
  initialCodes: PromoCode[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [codes, setCodes] = useState(initialCodes);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<Form>(blankForm());
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = codes.find((c) => c.id === selectedId);

  function newCode() {
    setSelectedId("");
    setForm(blankForm());
    setMessage("");
  }

  function selectCode(c: PromoCode) {
    setSelectedId(c.id);
    setForm(toForm(c));
    setMessage("");
  }

  async function refresh(nextId?: string) {
    const { data, error } = await supabase
      .from("promo_codes")
      .select(
        "id, code, discount_percent, starts_at, ends_at, max_uses, used_count, is_active, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      return;
    }
    const next = (data ?? []) as PromoCode[];
    setCodes(next);
    if (nextId) {
      const found = next.find((c) => c.id === nextId);
      if (found) {
        setSelectedId(found.id);
        setForm(toForm(found));
        return;
      }
    }
    if (selectedId) {
      const found = next.find((c) => c.id === selectedId);
      if (!found) {
        setSelectedId("");
        setForm(blankForm());
      }
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const code = form.code.trim().toUpperCase();
    const percent = Number.parseInt(form.discount_percent, 10);
    if (!code) {
      setSaving(false);
      setMessage("Code is required.");
      return;
    }
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      setSaving(false);
      setMessage("Discount percent must be between 1 and 100.");
      return;
    }
    const maxUses = form.max_uses.trim() ? Number.parseInt(form.max_uses, 10) : null;
    if (maxUses != null && (!Number.isFinite(maxUses) || maxUses < 1)) {
      setSaving(false);
      setMessage("Max uses must be a positive number, or leave blank for unlimited.");
      return;
    }

    const payload = {
      code,
      discount_percent: percent,
      starts_at: toIso(form.starts_at) ?? new Date().toISOString(),
      ends_at: toIso(form.ends_at),
      max_uses: maxUses,
      is_active: form.is_active,
    };

    if (selected) {
      const { error } = await supabase
        .from("promo_codes")
        .update(payload)
        .eq("id", selected.id);
      setSaving(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Promo code updated.");
      await refresh(selected.id);
    } else {
      const { data, error } = await supabase
        .from("promo_codes")
        .insert(payload)
        .select("id")
        .single();
      setSaving(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Promo code created.");
      await refresh(data?.id);
    }
  }

  async function deleteCode() {
    if (!selected) return;
    const ok = window.confirm(`Delete promo code ${selected.code}?`);
    if (!ok) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSelectedId("");
    setForm(blankForm());
    setMessage("Promo code deleted.");
    await refresh();
  }

  return (
    <section className="adminSplit">
      <div>
        <button
          className="adminButton adminButtonPrimary"
          onClick={newCode}
          style={{ marginBottom: "0.6rem", width: "100%" }}
          type="button"
        >
          + New promo code
        </button>
        <div className="adminList">
          {codes.length === 0 ? (
            <p className="adminEmpty">No codes yet.</p>
          ) : (
            codes.map((c) => {
              const expired = isExpired(c);
              const exhausted =
                c.max_uses != null && c.used_count >= c.max_uses;
              const status = !c.is_active
                ? "Disabled"
                : expired
                  ? "Expired"
                  : exhausted
                    ? "Used up"
                    : "Active";
              return (
                <button
                  className={`adminListItem${c.id === selectedId ? " adminListItemActive" : ""}`}
                  key={c.id}
                  onClick={() => selectCode(c)}
                  type="button"
                >
                  <span style={{ fontWeight: 500, letterSpacing: "0.04em" }}>
                    {c.code} · {c.discount_percent}% off
                  </span>
                  <small>
                    {status} · {c.used_count} use{c.used_count === 1 ? "" : "s"} ·
                    ends {fmtDate(c.ends_at)}
                  </small>
                </button>
              );
            })
          )}
        </div>
      </div>

      <form className="adminCard adminForm" onSubmit={save}>
        <div className="adminPanelHead">
          <h2>{selected ? `Edit ${selected.code}` : "New promo code"}</h2>
        </div>

        <div className="adminFormGrid">
          <label className="adminFormRow">
            <span className="adminFormLabel">Code</span>
            <input
              autoCapitalize="characters"
              className="adminInput"
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="SPRING20"
              required
              style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
              value={form.code}
            />
          </label>
          <label className="adminFormRow">
            <span className="adminFormLabel">Discount %</span>
            <input
              className="adminInput"
              max={100}
              min={1}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount_percent: e.target.value }))
              }
              required
              type="number"
              value={form.discount_percent}
            />
          </label>
        </div>

        <div className="adminFormGrid">
          <label className="adminFormRow">
            <span className="adminFormLabel">Starts</span>
            <input
              className="adminInput"
              onChange={(e) =>
                setForm((f) => ({ ...f, starts_at: e.target.value }))
              }
              type="date"
              value={form.starts_at}
            />
          </label>
          <label className="adminFormRow">
            <span className="adminFormLabel">Ends (optional)</span>
            <input
              className="adminInput"
              onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
              type="date"
              value={form.ends_at}
            />
          </label>
        </div>

        <label className="adminFormRow">
          <span className="adminFormLabel">Max uses (blank = unlimited)</span>
          <input
            className="adminInput"
            min={1}
            onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
            placeholder="100"
            type="number"
            value={form.max_uses}
          />
        </label>

        <label className="adminCheckRow">
          <input
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
            type="checkbox"
          />
          <span style={{ fontSize: "0.9rem" }}>
            Active (uncheck to temporarily disable without deleting)
          </span>
        </label>

        {selected && (
          <p style={{ color: "var(--admin-muted)", fontSize: "0.82rem", margin: 0 }}>
            Used <strong>{selected.used_count}</strong>{" "}
            time{selected.used_count === 1 ? "" : "s"} so far · created{" "}
            {fmtDate(selected.created_at)}
          </p>
        )}

        {message && <div className="adminToast">{message}</div>}

        <div className="adminButtonRow">
          {selected && (
            <button
              className="adminButton adminButtonDanger"
              disabled={saving}
              onClick={deleteCode}
              type="button"
            >
              Delete
            </button>
          )}
          <button
            className="adminButton adminButtonPrimary"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : selected ? "Save changes" : "Create code"}
          </button>
        </div>
      </form>
    </section>
  );
}
