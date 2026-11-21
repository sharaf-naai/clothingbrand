// Fake catalogue typed with the products contract. Used while NEXT_PUBLIC_USE_MOCKS=true.
import type { Color, Product, ProductList, ProductListQuery, Size } from "../contracts/products.ts";
import { toSummary } from "../lib/summary.ts";

const C = {
  ivory: { name: "Ivory", hex: "#F4F1EC" },
  stone: { name: "Stone", hex: "#D9D3C9" },
  grey: { name: "Grey", hex: "#6B665F" },
  black: { name: "Black", hex: "#111111" },
  navy: { name: "Navy", hex: "#1F2A44" },
  burgundy: { name: "Burgundy", hex: "#6E1E2B" }, // the seasonal accent (CLAUDE.md §6, §8)
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

// The launch catalogue (CLAUDE.md §6). shortcut: products without a photo yet have images: [] (see docs/photo-prompts.md)
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
    images: ["/assets/products/trench.webp"],
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
    images: ["/assets/products/wide-leg-trousers.webp"],
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
    images: ["/assets/products/canvas-tote.webp"],
    variants: variants("VY-TOTE", ["ONE"], [C.ivory, C.navy], 6000),
    createdAt: "2026-10-01T09:00:00Z",
  },
  {
    id: "p_overshirt",
    slug: "overshirt",
    name: "Wool Overshirt",
    description: "A heavy brushed-wool overshirt with two chest pockets, worn open as a light jacket.",
    section: "MAN",
    category: outerwear,
    drop: drop01,
    price: eur(16000),
    images: [],
    variants: variants("VY-OVER", ["S", "M", "L", "XL"], [C.stone, C.navy], 16000, ["XL/Navy"]),
    createdAt: "2026-11-02T10:00:00Z",
  },
  {
    id: "p_sweater",
    slug: "fine-knit-sweater",
    name: "Fine-Knit Sweater",
    description: "A fine merino crew-neck with a relaxed body and long ribbed cuffs.",
    section: "WOMAN",
    category: tops,
    drop: drop01,
    price: eur(13000),
    images: ["/assets/products/fine-knit-sweater.webp"],
    variants: variants("VY-KNIT", ["XS", "S", "M", "L"], [C.grey, C.ivory, C.burgundy], 13000, ["M/Burgundy"]),
    createdAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "p_blazer",
    slug: "wool-blazer",
    name: "Wool Blazer",
    description: "A single-breasted blazer in soft wool, cut long and slightly oversized.",
    section: "WOMAN",
    category: outerwear,
    drop: null,
    price: eur(29000),
    images: ["/assets/products/wool-blazer.webp"],
    variants: variants("VY-BLZR", ["XS", "S", "M", "L"], [C.black, C.stone], 29000),
    createdAt: "2026-10-28T09:00:00Z",
  },
  {
    id: "p_oxford",
    slug: "oxford-shirt",
    name: "Oxford Shirt",
    description: "A button-down shirt in washed oxford cotton with a soft collar and a straight hem.",
    section: "MAN",
    category: tops,
    drop: null,
    price: eur(9500),
    images: [],
    variants: variants("VY-OXF", ["S", "M", "L", "XL"], [C.ivory, C.navy], 9500),
    createdAt: "2026-10-25T09:00:00Z",
  },
  {
    id: "p_denim",
    slug: "straight-denim",
    name: "Straight Denim",
    description: "Rigid cotton denim with a mid rise and a straight, full-length leg.",
    section: "MAN",
    category: bottoms,
    drop: null,
    price: eur(12000),
    images: [],
    variants: variants("VY-DNM", ["S", "M", "L", "XL"], [C.navy, C.black], 12000, ["S/Black"]),
    createdAt: "2026-10-22T09:00:00Z",
  },
  {
    id: "p_pleated",
    slug: "pleated-trousers",
    name: "Pleated Trousers",
    description: "Double-pleated wool trousers with a relaxed thigh and a tapered leg.",
    section: "MAN",
    category: bottoms,
    drop: null,
    price: eur(14000),
    images: [],
    variants: variants("VY-PLT", ["S", "M", "L", "XL"], [C.grey, C.stone], 14000),
    createdAt: "2026-10-18T09:00:00Z",
  },
  {
    id: "p_cap",
    slug: "cap",
    name: "Cotton Cap",
    description: "A six-panel cap in washed cotton twill with an adjustable strap. No logo.",
    section: "UNISEX",
    category: accessories,
    drop: null,
    price: eur(3500),
    images: ["/assets/products/cap.webp"],
    variants: variants("VY-CAP", ["ONE"], [C.stone, C.black, C.navy], 3500),
    createdAt: "2026-10-10T09:00:00Z",
  },
  {
    id: "p_belt",
    slug: "leather-belt",
    name: "Leather Belt",
    description: "A narrow belt in vegetable-tanned leather with a plain brushed buckle.",
    section: "UNISEX",
    category: accessories,
    drop: null,
    price: eur(6500),
    images: ["/assets/products/leather-belt.webp"],
    variants: variants("VY-BELT", ["S", "M", "L"], [C.black], 6500),
    createdAt: "2026-10-05T09:00:00Z",
  },
  {
    id: "p_beanie",
    slug: "beanie",
    name: "Ribbed Beanie",
    description: "A deep ribbed beanie in soft wool, worn folded or slouched.",
    section: "UNISEX",
    category: accessories,
    drop: null,
    price: eur(4000),
    images: ["/assets/products/beanie.webp"],
    variants: variants("VY-BEAN", ["ONE"], [C.grey, C.ivory, C.burgundy], 4000),
    createdAt: "2026-09-28T09:00:00Z",
  },
  {
    id: "p_scarf",
    slug: "merino-scarf",
    name: "Merino Scarf",
    description: "A long, light merino scarf with finished edges.",
    section: "UNISEX",
    category: accessories,
    drop: null,
    price: eur(7500),
    images: ["/assets/products/merino-scarf.webp"],
    variants: variants("VY-SCRF", ["ONE"], [C.burgundy, C.grey], 7500),
    createdAt: "2026-09-20T09:00:00Z",
  },
];


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
