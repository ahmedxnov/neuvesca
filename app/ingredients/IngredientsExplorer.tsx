import Image from "next/image";

type GalleryItem = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

const items: GalleryItem[] = [
  {
    slug: "avocado",
    name: "Avocado Oil",
    tagline: "Deep Moisture",
    image: "/images/ingredients/avocado.jpeg",
  },
  {
    slug: "bay-leaves",
    name: "Bay Leaves",
    tagline: "Aromatic Lift",
    image: "/images/ingredients/leaves.jpeg",
  },
  {
    slug: "beeswax",
    name: "Beeswax",
    tagline: "Protective Seal",
    image: "/images/ingredients/bees.jpeg",
  },
  {
    slug: "beetroot",
    name: "Beetroot",
    tagline: "Natural Pigment",
    image: "/images/ingredients/beetroot.jpeg",
  },
  {
    slug: "coconut-oil",
    name: "Coconut Oil",
    tagline: "Barrier & Bind",
    image: "/images/ingredients/cocunut.jpeg",
  },
  {
    slug: "dates",
    name: "Dates",
    tagline: "Sweet Depth",
    image: "/images/ingredients/dates.jpeg",
  },
  {
    slug: "olive-oil",
    name: "Olive Oil",
    tagline: "Antioxidant Care",
    image: "/images/ingredients/olive-oil.jpeg",
  },
  {
    slug: "sweet-almond",
    name: "Sweet Almond",
    tagline: "Skin Softening",
    image: "/images/ingredients/almonds.jpeg",
  },
];

export default function IngredientsGallery() {
  return (
    <div className="ingredientGallery">
      {items.map((item, idx) => (
        <article className="ingredientCard" id={item.slug} key={item.slug}>
          <Image
            alt={item.name}
            className="ingredientCardImage"
            fill
            priority={idx < 4}
            sizes="(max-width: 980px) 50vw, 25vw"
            src={item.image}
          />
          <div className="ingredientCardCopy">
            <h3>{item.name}</h3>
            <span>{item.tagline}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
