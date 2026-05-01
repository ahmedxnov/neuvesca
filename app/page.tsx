import Link from "next/link";
import { listActiveProducts } from "@/lib/queries/products";
import { formatPrice } from "@/lib/format";

const reviews = [
  {
    quote: "The throw is elegant without taking over the room.",
    name: "Eloise R.",
    place: "Copenhagen",
  },
  {
    quote: "Looks beautiful unlit and even better during a slow dinner.",
    name: "Marguerite A.",
    place: "Lisbon",
  },
  {
    quote: "A candle that actually feels considered from scent to vessel.",
    name: "Theo M.",
    place: "Brooklyn",
  },
];

function Stars() {
  return (
    <span className="stars" aria-label="Five out of five">
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
    </span>
  );
}

export default async function Home() {
  const products = await listActiveProducts();
  const featured = products.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Poured in small luminous batches</p>
          <h1>Fragrance for rooms that deserve a softer pulse.</h1>
          <p className="lede">
            Neuvesca crafts scented candles for lingering evenings, fresh sheets,
            and the quiet minutes that make a place feel personal.
          </p>
          <div className="heroActions">
            <Link className="button primary" href="/products">
              Explore scents
            </Link>
            <Link className="button secondary" href="/about">
              Our studio
            </Link>
          </div>
          <div className="heroPanel">
            <span>Current atmosphere</span>
            <strong>White tea, fig leaf, clean cedar</strong>
            <p>A pale, open scent for bedrooms, reading corners, and slow mornings.</p>
          </div>
        </div>
        <div className="heroImage" aria-label="Neuvesca candle on a calm shelf" />
      </section>

      <section className="promise" aria-label="Brand promises">
        <span>Soy coconut wax</span>
        <span>Clean fragrance oils</span>
        <span>Reusable glass vessels</span>
        <span>45 hour burn</span>
      </section>

      <section className="section" id="shop">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Scent library</p>
            <h2>The Neuvesca cabinet.</h2>
          </div>
          <Link className="sectionLink" href="/products">View all scents</Link>
        </div>
        <div className="productGrid">
          {featured.map((product) => (
            <Link
              className="productCard"
              key={product.id}
              href={`/products/${product.slug}`}
            >
              <div className={`productVisual ${product.tone ?? ""}`}>
                <div className="productMeta">
                  <span>{product.family}</span>
                  <span>{product.burn_time_hours} hr burn</span>
                </div>
                <div className="candle">
                  <span>neuvesca</span>
                </div>
              </div>
              <div className="productInfo">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div>
                  <span>{formatPrice(product.price_cents, product.currency)}</span>
                  <span>View notes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ritual" id="ritual">
        <div className="ritualIntro">
          <p className="eyebrow">Scent finder</p>
          <h2>Choose by the hour you want to keep.</h2>
          <p>
            A small guide for matching fragrance to the room, the light, and the
            time of day you most want to soften.
          </p>
        </div>
        <div className="ritualGrid">
          <article>
            <span>Morning</span>
            <h3>Clean tea, pale woods, open windows.</h3>
            <p>No. 01 White Tea or No. 04 Neroli Stone</p>
          </article>
          <article>
            <span>Afternoon</span>
            <h3>Green stems, linen, a recently cleared desk.</h3>
            <p>No. 03 Sage Linen or No. 05 Velvet Fig</p>
          </article>
          <article>
            <span>Evening</span>
            <h3>Amber, resin, low lamps, softened edges.</h3>
            <p>No. 02 Amber Veil or No. 06 Cedar Smoke</p>
          </article>
        </div>
      </section>

      <section className="story" id="journal">
        <div className="storyImage" />
        <div className="storyCopy">
          <p className="eyebrow">The Neuvesca standard</p>
          <h2>A vessel, a room, a ritual. Nothing extra.</h2>
          <p>
            Each candle is designed with a restrained fragrance pyramid, a
            cotton wick, and a glass form intended to stay useful after the last
            burn.
          </p>
          <Link className="storyLink" href="/about">Read our story</Link>
        </div>
      </section>

      <section className="reviews" aria-label="Customer reviews">
        <div className="reviewsHeader">
          <p className="eyebrow">Kept rooms, kept letters</p>
          <h2>Quiet words from quieter homes.</h2>
        </div>
        <div className="reviewsGrid">
          {reviews.map((review) => (
            <figure key={review.quote}>
              <Stars />
              <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
              <figcaption>
                <span>{review.name}</span>
                <span>{review.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
