/**
 * A stand-in POS catalog. Nothing here comes from a service — the demo needs
 * items on screen before it can talk about conditions, and each product simply
 * declares which condition ids the checkout should ask ECS about.
 *
 * The ids are the ones a Nordic grocery tenant would carry. Any id the signed-in
 * tenant does not have shows up as "not in catalog" on the line, which is the
 * cue to go create it on the Condition catalog screen.
 */
export interface CatalogProduct {
  sku: string;
  name: string;
  price: number;
  glyph: string;
  conditionIds: string[];
  /** Item attributes BOOLEAN/WHITELIST project restrictions read. */
  attributes: Record<string, unknown>;
}

export const CURRENCY = "SEK";

export const DEMO_CATALOG: CatalogProduct[] = [
  {
    sku: "beer-lager-500",
    name: "Lager 500 ml",
    price: 18.9,
    glyph: "🍺",
    conditionIds: ["alcohol_se"],
    attributes: { productGroup: "beverages", ecoLabel: false },
  },
  {
    sku: "wine-red-750",
    name: "Red wine 750 ml",
    price: 89,
    glyph: "🍷",
    conditionIds: ["alcohol_se"],
    attributes: { productGroup: "beverages", ecoLabel: true },
  },
  {
    sku: "cigarettes-20",
    name: "Cigarettes 20-pack",
    price: 74.5,
    glyph: "🚬",
    conditionIds: ["alcohol_se", "tobacco_license_se"],
    attributes: { productGroup: "tobacco", ecoLabel: false },
  },
  {
    sku: "snus-24",
    name: "Snus 24-pack",
    price: 52,
    glyph: "🥫",
    conditionIds: ["tobacco_license_se"],
    attributes: { productGroup: "tobacco", ecoLabel: false },
  },
  {
    sku: "knife-chef-20",
    name: "Chef's knife 20 cm",
    price: 349,
    glyph: "🔪",
    conditionIds: ["knife_se"],
    attributes: { productGroup: "kitchen", ecoLabel: false },
  },
  {
    sku: "paracetamol-20",
    name: "Paracetamol 20 tablets",
    price: 29,
    glyph: "💊",
    conditionIds: ["pharmacy_license_se"],
    attributes: { productGroup: "pharmacy", ecoLabel: false },
  },
  {
    sku: "milk-1l",
    name: "Milk 1 l",
    price: 14.9,
    glyph: "🥛",
    conditionIds: [],
    attributes: { productGroup: "dairy", ecoLabel: true },
  },
  {
    sku: "bread-sourdough",
    name: "Sourdough loaf",
    price: 39,
    glyph: "🍞",
    conditionIds: [],
    attributes: { productGroup: "bakery", ecoLabel: true },
  },
];

const PRICE_FORMAT = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return `${PRICE_FORMAT.format(amount)} ${CURRENCY}`;
}
