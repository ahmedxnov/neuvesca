const products = [
  {
    name: "No. 01 White Tea",
    note: "white tea, fig leaf, clean cedar",
    family: "Fresh",
    burn: "45 hr burn",
    tone: "mist",
  },
  {
    name: "No. 02 Amber Veil",
    note: "amber resin, saffron, smoked vanilla",
    family: "Warm",
    burn: "48 hr burn",
    tone: "amber",
  },
  {
    name: "No. 03 Sage Linen",
    note: "clary sage, sun-warmed linen, vetiver",
    family: "Herbal",
    burn: "45 hr burn",
    tone: "sage",
  },
  {
    name: "No. 04 Neroli Stone",
    note: "neroli, rainwater, pale musk",
    family: "Citrus",
    burn: "42 hr burn",
    tone: "stone",
  },
  {
    name: "No. 05 Velvet Fig",
    note: "black fig, violet leaf, tonka",
    family: "Fruit",
    burn: "46 hr burn",
    tone: "fig",
  },
  {
    name: "No. 06 Cedar Smoke",
    note: "cedar ember, birch tar, cardamom",
    family: "Woody",
    burn: "50 hr burn",
    tone: "cedar",
  },
];

const reviews = [
  "The throw is elegant without taking over the room.",
  "Looks beautiful unlit and even better during a slow dinner.",
  "A candle that actually feels considered from scent to vessel.",
];

export default function Home() {
  return (
    <main>
      <header className="announcement">
        Spring pours now resting in the Neuvesca studio
      </header>

      <nav className="nav" aria-label="Main navigation">
        <a href="#shop">Scents</a>
        <a href="#ritual">Ritual</a>
        <div className="brand">neuvesca</div>
        <a href="#journal">Studio</a>
        <a href="#letter">Letter</a>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Poured in small luminous batches</p>
          <h1>Fragrance for rooms that deserve a softer pulse.</h1>
          <p>
            Neuvesca crafts scented candles for lingering evenings, fresh sheets,
            and the quiet minutes that make a place feel personal.
          </p>
          <div className="heroActions">
            <a className="button primary" href="#shop">
              Explore scents
            </a>
            <a className="button secondary" href="#ritual">
              Find a ritual
            </a>
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
          <a href="#ritual">Choose by mood</a>
        </div>
        <div className="productGrid">
          {products.map((product) => (
            <article className="productCard" key={product.name}>
              <div className="productMeta">
                <span>{product.family}</span>
                <span>{product.burn}</span>
              </div>
              <div className={`productVisual ${product.tone}`}>
                <div className="candle">
                  <span>neuvesca</span>
                </div>
              </div>
              <div className="productInfo">
                <h3>{product.name}</h3>
                <p>{product.note}</p>
                <div>
                  <span>{product.family} atmosphere</span>
                  <button type="button">View notes</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ritual" id="ritual">
        <div>
          <p className="eyebrow">Scent finder</p>
          <h2>Choose by the hour you want to keep.</h2>
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
          <a href="#shop">Explore the collection</a>
        </div>
      </section>

      <section className="reviews" aria-label="Customer reviews">
        {reviews.map((review) => (
          <blockquote key={review}>{review}</blockquote>
        ))}
      </section>

      <footer className="footer" id="letter">
        <div>
          <div className="brand">neuvesca</div>
          <p>Quiet fragrance for considered spaces.</p>
        </div>
        <form>
          <label htmlFor="email">Join the scent letter</label>
          <div>
            <input id="email" type="email" placeholder="Email address" />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </footer>
    </main>
  );
}
