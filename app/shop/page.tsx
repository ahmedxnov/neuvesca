import type { Metadata } from "next";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop | Neuvesca",
  description:
    "The full Neuvesca scent library — six considered candles for slow rooms and quiet hours.",
};

const families = ["All", "Fresh", "Warm", "Herbal", "Citrus", "Fruit", "Woody"];

export default function ShopPage() {
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
        <div className="shopFilters" aria-label="Filter by family">
          {families.map((family, idx) => (
            <button
              key={family}
              type="button"
              className={idx === 0 ? "active" : undefined}
            >
              {family}
            </button>
          ))}
        </div>
        <span className="shopCount">{products.length} scents</span>
      </section>

      <section className="section shopGrid">
        <div className="productGrid productGridFull">
          {products.map((product) => (
            <article className="productCard" key={product.name}>
              <div className={`productVisual ${product.tone}`}>
                <div className="productMeta">
                  <span>{product.family}</span>
                  <span>{product.burn}</span>
                </div>
                <div className="candle">
                  <span>neuvesca</span>
                </div>
              </div>
              <div className="productInfo">
                <h3>{product.name}</h3>
                <p>{product.note}</p>
                <div>
                  <span>{product.price}</span>
                  <button type="button">Add to room</button>
                </div>
              </div>
            </article>
          ))}
        </div>
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
