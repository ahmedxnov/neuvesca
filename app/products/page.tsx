import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listActiveProducts } from "@/lib/queries/products";
import { formatPrice, scentImageUrl, scentSwatchColor } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shop | Neuvesca",
  description:
    "The Neuvesca cabinet — body serum candles, hand-poured, each offered in several scents.",
};

export default async function ProductsPage() {
  const products = await listActiveProducts();

  return (
    <>
      <section className="shopHero">
        <div className="shopHeroCopy">
          <p className="eyebrow">The cabinet</p>
          <h1>Body serum candles, hand-poured.</h1>
          <p>
            Each candle is poured in a small batch and offered in several
            scents. Light the wick, let the wax pool transform into a warm,
            nourishing serum, and choose the scent that fits the room.
          </p>
        </div>
      </section>

      <section className="shopBar">
        <span className="shopCount">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
        <span className="shopHint">Choose a scent at checkout</span>
      </section>

      <section className="section shopGrid">
        {products.length === 0 ? (
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow">Nothing here yet</p>
            <h3 className="mb-3 [font-family:var(--serif)] text-[1.6rem] italic">
              The cabinet is being restocked.
            </h3>
            <p className="text-[var(--muted)]">
              Check back shortly — new pours arrive every few weeks.
            </p>
          </div>
        ) : (
          <div className="productGrid productGridFull">
            {products.map((product) => {
              const scentCount = product.primary_scents.length;
              const visibleScents = product.primary_scents.slice(0, 5);
              const overflow = scentCount - visibleScents.length;
              return (
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

                    {scentCount > 0 && (
                      <div className="productCardScents">
                        <ul aria-label={`${scentCount} scents available`}>
                          {visibleScents.map((s) => {
                            const img = scentImageUrl(s.slug);
                            return (
                              <li key={s.id} title={s.name}>
                                {img ? (
                                  <Image
                                    alt=""
                                    fill
                                    sizes="28px"
                                    src={img}
                                  />
                                ) : (
                                  <span
                                    style={{
                                      background: scentSwatchColor(s.slug),
                                    }}
                                  />
                                )}
                              </li>
                            );
                          })}
                          {overflow > 0 && (
                            <li className="productCardScentMore">+{overflow}</li>
                          )}
                        </ul>
                        <span>
                          {scentCount} {scentCount === 1 ? "scent" : "scents"}
                        </span>
                      </div>
                    )}

                    <div className="productCardFooter">
                      <span className="productCardPrice">
                        {formatPrice(product.price_cents, product.currency)}
                      </span>
                      <span className="productCardCta">View product →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="promise" aria-label="Brand promises">
        <span>Soy coconut wax</span>
        <span>Clean fragrance oils</span>
        <span>Reusable glass vessels</span>
        <span>40+ hour burn</span>
      </section>
    </>
  );
}
