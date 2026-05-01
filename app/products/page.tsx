import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  listActiveProducts,
  listAllPrimaryScents,
} from "@/lib/queries/products";
import { formatPrice } from "@/lib/format";
import ScentFilter from "./ScentFilter";

export const metadata: Metadata = {
  title: "Shop | Neuvesca",
  description:
    "The full Neuvesca scent library — six considered candles for slow rooms and quiet hours.",
};

type SearchParams = { scent?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const scentSlug = searchParams?.scent;
  const [products, scents] = await Promise.all([
    listActiveProducts({ scentSlug }),
    listAllPrimaryScents(),
  ]);

  return (
    <>
      <section className="pageIntro">
        <p className="eyebrow">The collection</p>
        <h1>The Neuvesca cabinet, in full.</h1>
        <p className="lede">
          Six candles, poured in small batches and shipped in reusable glass.
          Each one is designed to soften the room it&rsquo;s burned in — nothing
          shouts, nothing crowds.
        </p>
      </section>

      <section className="shopBar">
        <ScentFilter
          options={scents.map((s) => ({ slug: s.slug, name: s.name }))}
        />
        <span className="shopCount">
          {products.length} {products.length === 1 ? "scent" : "scents"}
        </span>
      </section>

      <section className="section shopGrid">
        {products.length === 0 ? (
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow">Nothing here yet</p>
            <h3 className="mb-3 [font-family:var(--serif)] text-[1.6rem] italic">
              No scents match that filter.
            </h3>
            <p className="text-[var(--muted)]">
              Try clearing the filter to view the full cabinet.
            </p>
            <Link
              className="storyLink mt-6 inline-block"
              href="/products"
            >
              Show all scents
            </Link>
          </div>
        ) : (
          <div className="productGrid productGridFull">
            {products.map((product) => (
              <Link
                className="productCard"
                href={`/products/${product.slug}`}
                key={product.id}
              >
                <div className={`productVisual ${product.tone ?? ""}`}>
                  <div className="productMeta">
                    <span>{product.family}</span>
                    <span>{product.burn_time_hours} hr burn</span>
                  </div>
                  {product.image_url ? (
                    <Image
                      alt={product.name}
                      className="object-contain"
                      fill
                      sizes="(min-width: 980px) 30vw, 90vw"
                      src={product.image_url}
                    />
                  ) : (
                    <div className="candle">
                      <span>neuvesca</span>
                    </div>
                  )}
                </div>
                <div className="productInfo">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div>
                    <span>
                      {formatPrice(product.price_cents, product.currency)}
                    </span>
                    <span className="text-[0.68rem] tracking-[0.22em]">
                      {product.primary_scents.length}{" "}
                      {product.primary_scents.length === 1
                        ? "scent"
                        : "scents"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="promise" aria-label="Brand promises">
        <span>Soy coconut wax</span>
        <span>Clean fragrance oils</span>
        <span>Reusable glass vessels</span>
        <span>45 hour burn</span>
      </section>
    </>
  );
}
