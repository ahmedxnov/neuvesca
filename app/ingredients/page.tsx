import type { Metadata } from "next";
import IngredientsGallery from "./IngredientsExplorer";

export const metadata: Metadata = {
  title: "Ingredients | Neuvesca",
  description:
    "What goes into every Neuvesca pour — wax, wick, fragrance, and the small things that matter.",
};

export default function IngredientsPage() {
  return (
    <>
      <section className="pageIntro pageIntroCentered">
        <p className="eyebrow">Inside every pour</p>
        <h1>The ingredients we keep, in plain words.</h1>
        <p className="lede">
          A short, honest list of what fills our vessels — what it does, where
          it&rsquo;s sourced, and how to handle it.
        </p>
      </section>

      <section className="section">
        <IngredientsGallery />
      </section>
    </>
  );
}
