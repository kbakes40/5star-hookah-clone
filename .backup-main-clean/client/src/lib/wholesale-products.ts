// ROR Tobacco 1kg Wholesale - Consolidated with flavor variants
// All flavors priced at $69.99

import { Product } from "./products";
import { rorFlavorImages, defaultRorImage } from "../data/ror-images";

const rorFlavors = [
  "Blueberry",
  "Blueberry Mint",
  "Blueberry Spice",
  "Chai Latte",
  "Cinnamon",
  "Double Apple",
  "Duo Meloney",
  "Frozen",
  "Frozen Cherry Berry",
  "Grape Mint",
  "Guava",
  "Gum Mint",
  "Hedonism",
  "Ice Blue Mint",
  "Kiwi",
  "Lemon Meringue",
  "Lemon Mint",
  "Lime Lights",
  "Mango",
  "Mi Punch",
  "Mint Avalanche",
  "Minty Choco Glacier",
  "Mintylicious",
  "Moonshine",
  "Narco Mint",
  "Orange",
  "Orangina Fizz",
  "Pineapple",
  "Pink Potion",
  "Raspberry Lemonade",
  "Ruby Red",
  "Sckittel's Crush",
  "Sexy Senorita",
  "Strawberry",
  "Slush",
  "Toot",
  "Vanilla",
  "White Peach",
  "Watermelon",
  "Watermelon Mint",
  "Yummy Gummy"
];

// Consolidated ROR product with all 41 flavors as variants
export const wholesaleProducts: Product[] = [
  {
    id: 'ror-tobacco-1kg',
    name: 'ROR Tobacco 1kg',
    price: 69.99,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663313071830/nltwSZTGdVdVTHiX.jpg",
    category: "wholesale",
    brand: "ROR",
    inStock: true,
    badge: 'WHOLESALE',
    variants: rorFlavors.map(flavor => ({
      id: flavor.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: flavor,
      description: `ROR ${flavor} flavor`,
      image: rorFlavorImages[flavor] || defaultRorImage
    }))
  }
];
