import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries/products";
import { formatPrice } from "@/lib/format";
import ProductPurchasePanel from "./ProductPurchasePanel";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Not found | Neuvesca" };
  return {
    title: `${product.name} | Neuvesca`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const { composition, ingredients } = product;
  const priceLabel = formatPrice(product.price_cents, product.currency);

  return (
    <article className="mx-auto grid max-w-[1280px] gap-[clamp(2.5rem,5vw,5rem)] px-[clamp(1.25rem,5vw,5.5rem)] py-[clamp(3rem,6vw,6rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-4">
        <div
          className={`productVisual ${product.tone ?? ""} relative aspect-[4/5] w-full`}
        >
          <div className="productMeta">
            <span>{product.family}</span>
            <span>{product.burn_time_hours} hr burn</span>
          </div>
          {product.image_url ? (
            <Image
              alt={product.name}
              className="object-contain"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={product.image_url}
            />
          ) : (
            <div className="candle">
              <span>neuvesca</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <p className="eyebrow">{product.family}</p>
          <h1 className="!max-w-none !text-[clamp(2.4rem,4.5vw,4.4rem)]">
            {product.name}
          </h1>
          <p className="lede !max-w-none">{product.description}</p>
          <p className="mt-3 text-[0.78rem] uppercase tracking-[0.24em] text-[var(--muted)]">
            {product.size_grams}g · {product.burn_time_hours} hour burn
          </p>
        </div>

        <ProductPurchasePanel
          priceLabel={priceLabel}
          primaryScents={product.primary_scents}
          productId={product.id}
        />

        <section className="grid gap-3 border-t border-[var(--line-soft)] pt-6">
          <p className="eyebrow !mb-0">Composition</p>
          <dl className="grid gap-3">
            {(["top", "heart", "base"] as const).map((role) => {
              const list = composition[role];
              if (list.length === 0) return null;
              return (
                <div className="grid grid-cols-[6rem_1fr] gap-3" key={role}>
                  <dt className="text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">
                    {role}
                  </dt>
                  <dd className="[font-family:var(--serif)] text-[1.05rem] italic">
                    {list.map((s) => s.name).join(", ")}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="grid gap-3 border-t border-[var(--line-soft)] pt-6">
          <p className="eyebrow !mb-0">Ingredients</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-1 text-[0.95rem] text-[var(--ink-soft)]">
            {ingredients.map((ing, idx) => (
              <li key={ing.id}>
                <Link
                  className="border-b border-[var(--line)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  href={`/ingredients#${ing.slug}`}
                >
                  {ing.name}
                </Link>
                {idx < ingredients.length - 1 ? "," : ""}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
