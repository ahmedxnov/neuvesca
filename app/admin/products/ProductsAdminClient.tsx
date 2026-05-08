"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/storage";
import { formatPrice } from "@/lib/format";

type NoteRole = "primary" | "top" | "heart" | "base";

export type AdminScentOption = {
  id: string;
  slug: string;
  name: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  family: string;
  burn_time_hours: number;
  tone: string | null;
  size_grams: number;
  price_cents: number;
  currency: string;
  image_url: string | null;
  is_active: boolean;
  product_scents: Array<{
    scent_id: string;
    note_role: NoteRole;
    sort_order: number;
  }>;
};

type ProductForm = {
  slug: string;
  name: string;
  description: string;
  family: string;
  burn_time_hours: string;
  tone: string;
  size_grams: string;
  price_cents: string;
  currency: string;
  image_url: string;
  is_active: boolean;
  primary: string;
  top: string;
  heart: string;
  base: string;
};

const inputClass =
  "w-full border border-[#cfd6ce] bg-white px-3 py-2 text-sm text-[#1b1f1d] outline-none focus:border-[#151816]";
const labelClass =
  "grid gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5f6963]";
const roleOrder: Record<NoteRole, number> = {
  primary: 0,
  top: 0,
  heart: 1,
  base: 2,
};

function blankForm(): ProductForm {
  return {
    slug: "",
    name: "",
    description: "",
    family: "",
    burn_time_hours: "45",
    tone: "mist",
    size_grams: "220",
    price_cents: "4800",
    currency: "EGP",
    image_url: "",
    is_active: true,
    primary: "",
    top: "",
    heart: "",
    base: "",
  };
}

function productToForm(product: AdminProduct): ProductForm {
  const role = (name: NoteRole) =>
    product.product_scents
      .filter((row) => row.note_role === name)
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.scent_id ?? "";

  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    family: product.family,
    burn_time_hours: String(product.burn_time_hours),
    tone: product.tone ?? "",
    size_grams: String(product.size_grams),
    price_cents: String(product.price_cents),
    currency: product.currency,
    image_url: product.image_url ?? "",
    is_active: product.is_active,
    primary: role("primary"),
    top: role("top"),
    heart: role("heart"),
    base: role("base"),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function ProductsAdminClient({
  initialProducts,
  scents,
}: {
  initialProducts: AdminProduct[];
  scents: AdminScentOption[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState(initialProducts[0]?.id ?? "");
  const [form, setForm] = useState<ProductForm>(
    initialProducts[0] ? productToForm(initialProducts[0]) : blankForm(),
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = products.find((product) => product.id === selectedId);

  async function refreshProducts(nextSelectedId?: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, slug, name, description, family, burn_time_hours, tone, size_grams, price_cents, currency, image_url, is_active,
         product_scents ( scent_id, note_role, sort_order )`,
      )
      .order("slug", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    const next = (data ?? []) as unknown as AdminProduct[];
    setProducts(next);
    const activeId = nextSelectedId || selectedId || next[0]?.id || "";
    const active = next.find((product) => product.id === activeId);
    setSelectedId(active?.id ?? "");
    setForm(active ? productToForm(active) : blankForm());
  }

  function selectProduct(product: AdminProduct) {
    setSelectedId(product.id);
    setForm(productToForm(product));
    setMessage("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function updateField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const uploadFile = imageInputRef.current?.files?.[0];
      let imageUrl = form.image_url.trim() || null;
      if (uploadFile) {
        const uploaded = await uploadProductImage(uploadFile);
        imageUrl = uploaded.publicUrl;
      }

      const payload = {
        slug: slugify(form.slug || form.name),
        name: form.name.trim(),
        description: form.description.trim(),
        family: form.family.trim(),
        burn_time_hours: parsePositiveInt(form.burn_time_hours, 45),
        tone: form.tone.trim() || null,
        size_grams: parsePositiveInt(form.size_grams, 220),
        price_cents: parsePositiveInt(form.price_cents, 0),
        currency: form.currency.trim().toUpperCase() || "EGP",
        image_url: imageUrl,
        is_active: form.is_active,
      };

      if (!payload.slug || !payload.name || !payload.family || !payload.description) {
        setMessage("Slug, name, family, and description are required.");
        return;
      }

      let productId = selectedId;
      if (selectedProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", selectedProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      const { error: deleteLinksError } = await supabase
        .from("product_scents")
        .delete()
        .eq("product_id", productId);
      if (deleteLinksError) throw deleteLinksError;

      const links = (["primary", "top", "heart", "base"] as NoteRole[])
        .map((role) => ({
          product_id: productId,
          scent_id: form[role],
          note_role: role,
          sort_order: roleOrder[role],
        }))
        .filter((link) => link.scent_id);

      if (links.length > 0) {
        const { error: insertLinksError } = await supabase
          .from("product_scents")
          .insert(links);
        if (insertLinksError) throw insertLinksError;
      }

      if (imageInputRef.current) imageInputRef.current.value = "";
      await refreshProducts(productId);
      setMessage("Product saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct() {
    if (!selectedProduct) return;
    setIsSaving(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);
      if (error) throw error;
      setSelectedId("");
      setForm(blankForm());
      await refreshProducts();
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete product. Deactivate it instead.",
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
            Products
          </p>
          <h1 className="!mb-0 !max-w-none !text-[clamp(2rem,4vw,3.4rem)]">
            Product cabinet.
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
          New product
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_1.15fr]">
        <div className="overflow-hidden border border-[#d9ded7] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#eef2ec] text-[0.68rem] uppercase tracking-[0.16em] text-[#5f6963]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">State</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  className={`cursor-pointer border-t border-[#edf0ec] hover:bg-[#f7f8f6] ${
                    product.id === selectedId ? "bg-[#f1f4ef]" : ""
                  }`}
                  key={product.id}
                  onClick={() => selectProduct(product)}
                >
                  <td className="px-4 py-3">
                    <strong className="block font-semibold">{product.name}</strong>
                    <span className="text-xs text-[#6b756f]">{product.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(product.price_cents, product.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {product.is_active ? "Active" : "Hidden"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="grid gap-4 border border-[#d9ded7] bg-white p-5" onSubmit={saveProduct}>
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
                onChange={(event) => updateField("slug", event.target.value)}
                onBlur={() => updateField("slug", slugify(form.slug || form.name))}
                required
                type="text"
                value={form.slug}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Description
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                onChange={(event) => updateField("description", event.target.value)}
                required
                value={form.description}
              />
            </label>
            <label className={labelClass}>
              Family
              <input
                className={inputClass}
                onChange={(event) => updateField("family", event.target.value)}
                required
                type="text"
                value={form.family}
              />
            </label>
            <label className={labelClass}>
              Tone
              <input
                className={inputClass}
                onChange={(event) => updateField("tone", event.target.value)}
                type="text"
                value={form.tone}
              />
            </label>
            <label className={labelClass}>
              Burn time
              <input
                className={inputClass}
                min="1"
                onChange={(event) => updateField("burn_time_hours", event.target.value)}
                required
                type="number"
                value={form.burn_time_hours}
              />
            </label>
            <label className={labelClass}>
              Size grams
              <input
                className={inputClass}
                min="1"
                onChange={(event) => updateField("size_grams", event.target.value)}
                required
                type="number"
                value={form.size_grams}
              />
            </label>
            <label className={labelClass}>
              Price cents
              <input
                className={inputClass}
                min="0"
                onChange={(event) => updateField("price_cents", event.target.value)}
                required
                type="number"
                value={form.price_cents}
              />
            </label>
            <label className={labelClass}>
              Currency
              <input
                className={inputClass}
                maxLength={3}
                onChange={(event) => updateField("currency", event.target.value)}
                required
                type="text"
                value={form.currency}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Image URL
              <input
                className={inputClass}
                onChange={(event) => updateField("image_url", event.target.value)}
                type="url"
                value={form.image_url}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Upload image
              <input
                accept="image/jpeg,image/png,image/webp,image/avif"
                className={inputClass}
                ref={imageInputRef}
                type="file"
              />
            </label>
          </div>

          <div className="grid gap-4 border-y border-[#edf0ec] py-4 md:grid-cols-4">
            {(["primary", "top", "heart", "base"] as NoteRole[]).map((role) => (
              <label className={labelClass} key={role}>
                {role}
                <select
                  className={inputClass}
                  onChange={(event) => updateField(role, event.target.value)}
                  value={form[role]}
                >
                  <option value="">None</option>
                  {scents.map((scent) => (
                    <option key={scent.id} value={scent.id}>
                      {scent.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
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
              {isSaving ? "Saving" : "Save product"}
            </button>
            {selectedProduct && (
              <button
                className="border border-[#b44b3f] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8f332a] disabled:opacity-50"
                disabled={isSaving}
                onClick={deleteProduct}
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
