// Fake catalogue typed with the products contract. Used while NEXT_PUBLIC_USE_MOCKS=true.
import type { Color, Product, ProductList, ProductListQuery, ProductSummary, Size } from "../contracts/products.ts";

const C = {
  ivory: { name: "Ivory", hex: "#F4F1EC" },
  stone: { name: "Stone", hex: "#D9D3C9" },
  grey: { name: "Grey", hex: "#6B665F" },
  black: { name: "Black", hex: "#111111" },
  navy: { name: "Navy", hex: "#1F2A44" },
} satisfies Record<string, Color>;

const eur = (amount: number) => ({ amount, currency: "EUR" });

/** Every size × colour, with stock 6 unless listed in `soldOut` as "SIZE/Colour". */
function variants(sku: string, sizes: Size[], colors: Color[], price: number, soldOut: string[] = []) {
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      id: `${sku}-${size}-${color.name}`.toLowerCase(),
      sku: `${sku}-${size}-${color.name.slice(0, 3)}`.toUpperCase(),
      size,
      color,
      stock: soldOut.includes(`${size}/${color.name}`) ? 0 : 6,
      price: eur(price),
    })),
  );
}

const outerwear = { slug: "outerwear", name: "Outerwear" };
const tops = { slug: "tops", name: "Tops" };
const bottoms = { slug: "bottoms", name: "Bottoms" };
const accessories = { slug: "accessories", name: "Accessories" };
const drop01 = { number: "01", name: "Autumn" };

// shortcut: only the wool coat has a photo; the others have images: [] until more are generated
export const mockProducts: Product[] = [
  {
    id: "p_wool_coat",
    slug: "wool-coat",
    name: "Oversized Wool Coat",
    description: "A long, unlined coat in brushed wool with dropped shoulders and deep pockets.",
    section: "WOMAN",
    category: outerwear,
    drop: drop01,
    price: eur(39000),
    images: ["/assets/hero-full.png"],
    variants: variants("VY-COAT", ["XS", "S", "M", "L"], [C.ivory, C.stone], 39000, ["S/Ivory"]),
    createdAt: "2026-11-01T09:00:00Z",
  },
  {
    id: "p_trench",
    slug: "trench",
    name: "Cotton Trench",
    description: "A clean double-breasted trench in dense cotton gabardine.",
    section: "WOMAN",
    category: outerwear,
    drop: drop01,
    price: eur(34000),
    images: [],
    variants: variants("VY-TRCH", ["XS", "S", "M", "L"], [C.stone], 34000),
    createdAt: "2026-11-02T09:00:00Z",
  },
  {
    id: "p_wide_leg",
    slug: "wide-leg-trousers",
    name: "Wide-Leg Trousers",
    description: "High-waisted trousers with a single pleat and a long, wide leg.",
    section: "WOMAN",
    category: bottoms,
    drop: null,
    price: eur(15000),
    images: [],
    variants: variants("VY-WIDE", ["XS", "S", "M", "L"], [C.stone, C.black], 15000),
    createdAt: "2026-10-20T09:00:00Z",
  },
  {
    id: "p_boxy_tee",
    slug: "boxy-tee",
    name: "Boxy Tee",
    description: "A heavyweight cotton tee with a short, boxy body.",
    section: "MAN",
    category: tops,
    drop: null,
    price: eur(4500),
    images: [],
    variants: variants("VY-TEE", ["S", "M", "L", "XL"], [C.ivory, C.black, C.grey], 4500),
    createdAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "p_hoodie",
    slug: "heavyweight-hoodie",
    name: "Heavyweight Hoodie",
    description: "Loopback cotton hoodie with a double-layer hood.",
    section: "MAN",
    category: tops,
    drop: drop01,
    price: eur(12000),
    images: [],
    // all sold out, so listings can show an out-of-stock state
    variants: variants("VY-HOOD", ["M", "L"], [C.grey], 12000, ["M/Grey", "L/Grey"]),
    createdAt: "2026-11-03T09:00:00Z",
  },
  {
    id: "p_tote",
    slug: "canvas-tote",
    name: "Canvas Tote",
    description: "A heavy canvas tote with long handles and an inside pocket.",
    section: "UNISEX",
    category: accessories,
    drop: null,
    price: eur(6000),
    images: [],
    variants: variants("VY-TOTE", ["ONE"], [C.ivory, C.navy], 6000),
    createdAt: "2026-10-01T09:00:00Z",
  },
];

function toSummary(p: Product): ProductSummary {
  const colors = [...new Map(p.variants.map((v) => [v.color.name, v.color])).values()];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    section: p.section,
    price: p.price,
    images: p.images,
    colors,
    inStock: p.variants.some((v) => v.stock > 0),
  };
}

/** Mimics GET /api/products: filters, sorts and pages the mock catalogue. */
export function listMockProducts(query: ProductListQuery): ProductList {
  const q = query.q?.toLowerCase();
  const matches = mockProducts
    .filter((p) => !query.section || p.section === query.section || p.section === "UNISEX")
    .filter((p) => !query.category || p.category.slug === query.category)
    .filter((p) => !query.drop || p.drop?.number === query.drop)
    .filter((p) => !query.color || p.variants.some((v) => v.color.name.toLowerCase() === query.color!.toLowerCase()))
    .filter((p) => !query.size || p.variants.some((v) => v.size === query.size))
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    .sort((a, b) =>
      query.sort === "price-asc"
        ? a.price.amount - b.price.amount
        : query.sort === "price-desc"
          ? b.price.amount - a.price.amount
          : b.createdAt.localeCompare(a.createdAt),
    );
  const start = (query.page - 1) * query.pageSize;
  return {
    items: matches.slice(start, start + query.pageSize).map(toSummary),
    page: query.page,
    pageSize: query.pageSize,
    total: matches.length,
  };
}

export const getMockProduct = (slug: string) => mockProducts.find((p) => p.slug === slug) ?? null;
