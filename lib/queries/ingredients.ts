import { createClient } from "@/lib/supabase/server";

export type IngredientWithProducts = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  safety_notes: string | null;
  products: { slug: string; name: string }[];
};

type RawRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  safety_notes: string | null;
  product_ingredients: Array<{
    products: { slug: string; name: string; is_active: boolean } | null;
  }>;
};

export async function listIngredients(): Promise<IngredientWithProducts[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select(
      `id, slug, name, description, safety_notes,
       product_ingredients ( products ( slug, name, is_active ) )`,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as RawRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    safety_notes: row.safety_notes,
    products: row.product_ingredients
      .map((pi) => pi.products)
      .filter((p): p is { slug: string; name: string; is_active: boolean } =>
        Boolean(p && p.is_active),
      )
      .map(({ slug, name }) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
