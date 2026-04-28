import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio | Neuvesca",
  description:
    "The studio behind Neuvesca — a small atelier pouring scented candles for considered, unhurried rooms.",
};

const principles = [
  {
    label: "Restraint",
    title: "Three notes, never twelve.",
    body: "Every Neuvesca scent is built around a tight pyramid — a top, a heart, a base. Nothing competes for attention.",
  },
  {
    label: "Slow craft",
    title: "Poured by hand in small batches.",
    body: "We pour weekly, in batches of forty. Each candle rests for ten days before it leaves the studio.",
  },
  {
    label: "Quiet materials",
    title: "Soy coconut wax, cotton wicks, real glass.",
    body: "Vessels are designed to outlive the candle — to keep flowers, hold sea salt, or simply sit on a shelf.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pageIntro pageIntroCentered">
        <p className="eyebrow">The studio</p>
        <h1>A small atelier for quietly luxurious rooms.</h1>
        <p className="lede">
          Neuvesca is poured in a converted printers&rsquo; studio at the edge
          of the old quarter. We make candles for the kind of evenings you want
          to keep — slow ones, with the lamps low and the music almost off.
        </p>
      </section>

      <section className="aboutHero">
        <div className="aboutHeroImage" />
      </section>

      <section className="story aboutStory">
        <div className="storyCopy">
          <p className="eyebrow">A note from the maker</p>
          <h2>We started with one scent and an empty kitchen.</h2>
          <p>
            Neuvesca began in 2021, in a top-floor flat with a single induction
            burner and a borrowed thermometer. The first candle was a fig and
            cedar pour, made for a friend&rsquo;s housewarming. People kept
            asking where it came from — so, slowly, it became something.
          </p>
          <p>
            Four years later, we still pour every candle by hand. We work with
            a perfumer in the south of France for the oils, a glassmaker an
            hour&rsquo;s drive away for the vessels, and a small letterpress
            for the labels. Nothing is mass-produced. Nothing is rushed.
          </p>
        </div>
        <div className="storyImage aboutStoryImage" />
      </section>

      <section className="section principles">
        <div className="sectionHeader sectionHeaderCentered">
          <div>
            <p className="eyebrow">How we work</p>
            <h2>Three principles we don&rsquo;t bend on.</h2>
          </div>
        </div>
        <div className="principlesGrid">
          {principles.map((p) => (
            <article key={p.label}>
              <span>{p.label}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aboutCta">
        <div>
          <p className="eyebrow">The library</p>
          <h2>Six candles, poured slowly.</h2>
          <p>
            The full collection is available now — each one designed for a
            specific hour, room, and rhythm.
          </p>
          <Link className="button primary" href="/shop">
            View the collection
          </Link>
        </div>
      </section>
    </>
  );
}
