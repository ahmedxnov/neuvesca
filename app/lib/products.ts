export type Product = {
  name: string;
  note: string;
  family: string;
  burn: string;
  tone: string;
  price: string;
  size: string;
  description: string;
};

export const products: Product[] = [
  {
    name: "No. 01 White Tea",
    note: "white tea, fig leaf, clean cedar",
    family: "Fresh",
    burn: "45 hr burn",
    tone: "mist",
    price: "€48",
    size: "220g",
    description:
      "A pale, open scent for bedrooms, reading corners, and slow mornings.",
  },
  {
    name: "No. 02 Amber Veil",
    note: "amber resin, saffron, smoked vanilla",
    family: "Warm",
    burn: "48 hr burn",
    tone: "amber",
    price: "€52",
    size: "220g",
    description:
      "Soft amber and resin for low lamps, late dinners, and the hour after.",
  },
  {
    name: "No. 03 Sage Linen",
    note: "clary sage, sun-warmed linen, vetiver",
    family: "Herbal",
    burn: "45 hr burn",
    tone: "sage",
    price: "€48",
    size: "220g",
    description:
      "A green, sun-bleached scent for cleared desks and quiet afternoons.",
  },
  {
    name: "No. 04 Neroli Stone",
    note: "neroli, rainwater, pale musk",
    family: "Citrus",
    burn: "42 hr burn",
    tone: "stone",
    price: "€48",
    size: "220g",
    description:
      "Cool citrus and rain-washed musk for kitchens and open windows.",
  },
  {
    name: "No. 05 Velvet Fig",
    note: "black fig, violet leaf, tonka",
    family: "Fruit",
    burn: "46 hr burn",
    tone: "fig",
    price: "€52",
    size: "220g",
    description:
      "Plush fig and violet for soft music, candlelight, and lingering hours.",
  },
  {
    name: "No. 06 Cedar Smoke",
    note: "cedar ember, birch tar, cardamom",
    family: "Woody",
    burn: "50 hr burn",
    tone: "cedar",
    price: "€54",
    size: "220g",
    description:
      "Smoked cedar and warm spice for studios, libraries, and cold nights.",
  },
];
