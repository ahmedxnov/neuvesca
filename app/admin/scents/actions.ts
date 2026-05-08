"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_IMAGES_BUCKET = "product-images";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin only.");
  return supabase;
}

async function uploadIfPresent(
  supabase: ReturnType<typeof createClient>,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP or AVIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller.");
  }
  const ext = EXT[file.type];
  const path = `scents/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
  if (error) throw new Error(error.message || "Upload failed.");
  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function saveScent(formData: FormData) {
  const supabase = await assertAdmin();
  const id = (formData.get("id") as string | null) || null;
  const name = ((formData.get("name") as string) || "").trim();
  const slugRaw = ((formData.get("slug") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const imageUrlInput =
    ((formData.get("image_url") as string) || "").trim() || null;
  const file = formData.get("image_file") as File | null;

  if (!name) return { ok: false as const, error: "Name is required." };
  const slug = slugify(slugRaw || name);
  if (!slug) return { ok: false as const, error: "Slug is required." };

  let image_url = imageUrlInput;
  try {
    const uploaded = await uploadIfPresent(supabase, file);
    if (uploaded) image_url = uploaded;
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Upload failed.",
    };
  }

  const payload = {
    slug,
    name,
    description: description || null,
    image_url,
    is_active: true,
  };

  if (id) {
    const { error } = await supabase
      .from("scents")
      .update(payload)
      .eq("id", id);
    if (error) return { ok: false as const, error: error.message };
    revalidatePath("/admin/scents");
    return { ok: true as const, id };
  } else {
    const { data, error } = await supabase
      .from("scents")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    revalidatePath("/admin/scents");
    return { ok: true as const, id: data.id };
  }
}

export async function deleteScent(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("scents").delete().eq("id", id);
  if (error) {
    return {
      ok: false as const,
      error: error.message.includes("product_scents")
        ? "Can't delete — this scent is still attached to products."
        : error.message,
    };
  }
  revalidatePath("/admin/scents");
  return { ok: true as const };
}
