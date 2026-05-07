"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AdminScent = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  family: string | null;
  is_active: boolean;
};

type ScentForm = {
  slug: string;
  name: string;
  description: string;
  family: string;
  is_active: boolean;
};

const inputClass =
  "w-full border border-[#cfd6ce] bg-white px-3 py-2 text-sm text-[#1b1f1d] outline-none focus:border-[#151816]";
const labelClass =
  "grid gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5f6963]";

function blankForm(): ScentForm {
  return {
    slug: "",
    name: "",
    description: "",
    family: "",
    is_active: true,
  };
}

function scentToForm(scent: AdminScent): ScentForm {
  return {
    slug: scent.slug,
    name: scent.name,
    description: scent.description ?? "",
    family: scent.family ?? "",
    is_active: scent.is_active,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ScentsAdminClient({
  initialScents,
}: {
  initialScents: AdminScent[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [scents, setScents] = useState(initialScents);
  const [selectedId, setSelectedId] = useState(initialScents[0]?.id ?? "");
  const [form, setForm] = useState<ScentForm>(
    initialScents[0] ? scentToForm(initialScents[0]) : blankForm(),
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedScent = scents.find((scent) => scent.id === selectedId);

  async function refreshScents(nextSelectedId?: string) {
    const { data, error } = await supabase
      .from("scents")
      .select("id, slug, name, description, family, is_active")
      .order("slug", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    const next = (data ?? []) as AdminScent[];
    setScents(next);
    const activeId = nextSelectedId || selectedId || next[0]?.id || "";
    const active = next.find((scent) => scent.id === activeId);
    setSelectedId(active?.id ?? "");
    setForm(active ? scentToForm(active) : blankForm());
  }

  function updateField<K extends keyof ScentForm>(key: K, value: ScentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveScent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const payload = {
        slug: slugify(form.slug || form.name),
        name: form.name.trim(),
        description: form.description.trim() || null,
        family: form.family.trim() || null,
        is_active: form.is_active,
      };

      if (!payload.slug || !payload.name) {
        setMessage("Slug and name are required.");
        return;
      }

      let scentId = selectedId;
      if (selectedScent) {
        const { error } = await supabase
          .from("scents")
          .update(payload)
          .eq("id", selectedScent.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("scents")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        scentId = data.id;
      }

      await refreshScents(scentId);
      setMessage("Scent saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save scent.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteScent() {
    if (!selectedScent) return;
    setIsSaving(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("scents")
        .delete()
        .eq("id", selectedScent.id);
      if (error) throw error;
      setSelectedId("");
      setForm(blankForm());
      await refreshScents();
      setMessage("Scent deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete scent. Deactivate it instead.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border border-[#d9ded7] bg-white p-6">
        <div>
          <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#6b756f]">
            Scents
          </p>
          <h1 className="!mb-0 !max-w-none !text-[clamp(2rem,4vw,3.4rem)]">
            Scent library.
          </h1>
        </div>
        <button
          className="border border-[#151816] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] hover:bg-[#151816] hover:text-white"
          onClick={() => {
            setSelectedId("");
            setForm(blankForm());
            setMessage("");
          }}
          type="button"
        >
          New scent
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_1.15fr]">
        <div className="overflow-hidden border border-[#d9ded7] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#eef2ec] text-[0.68rem] uppercase tracking-[0.16em] text-[#5f6963]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Family</th>
                <th className="px-4 py-3">State</th>
              </tr>
            </thead>
            <tbody>
              {scents.map((scent) => (
                <tr
                  className={`cursor-pointer border-t border-[#edf0ec] hover:bg-[#f7f8f6] ${
                    scent.id === selectedId ? "bg-[#f1f4ef]" : ""
                  }`}
                  key={scent.id}
                  onClick={() => {
                    setSelectedId(scent.id);
                    setForm(scentToForm(scent));
                    setMessage("");
                  }}
                >
                  <td className="px-4 py-3">
                    <strong className="block font-semibold">{scent.name}</strong>
                    <span className="text-xs text-[#6b756f]">{scent.slug}</span>
                  </td>
                  <td className="px-4 py-3">{scent.family || "Unsorted"}</td>
                  <td className="px-4 py-3">
                    {scent.is_active ? "Active" : "Hidden"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="grid gap-4 border border-[#d9ded7] bg-white p-5" onSubmit={saveScent}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Name
              <input
                className={inputClass}
                onChange={(event) => updateField("name", event.target.value)}
                required
                type="text"
                value={form.name}
              />
            </label>
            <label className={labelClass}>
              Slug
              <input
                className={inputClass}
                onBlur={() => updateField("slug", slugify(form.slug || form.name))}
                onChange={(event) => updateField("slug", event.target.value)}
                required
                type="text"
                value={form.slug}
              />
            </label>
            <label className={labelClass}>
              Family
              <input
                className={inputClass}
                onChange={(event) => updateField("family", event.target.value)}
                type="text"
                value={form.family}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Description
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                onChange={(event) => updateField("description", event.target.value)}
                value={form.description}
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-[#4b554f]">
            <input
              checked={form.is_active}
              onChange={(event) => updateField("is_active", event.target.checked)}
              type="checkbox"
            />
            Active in storefront
          </label>

          {message && (
            <p className="border-l-2 border-[#151816] bg-[#f7f8f6] px-3 py-2 text-sm text-[#303832]">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              className="border border-[#151816] bg-[#151816] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving" : "Save scent"}
            </button>
            {selectedScent && (
              <button
                className="border border-[#b44b3f] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8f332a] disabled:opacity-50"
                disabled={isSaving}
                onClick={deleteScent}
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
