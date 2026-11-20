import { Size, type Color, type Product, type Variant } from "../contracts/products.ts";

export type Selection = {
  colors: Color[];
  color: Color;
  /** Sizes offered in the selected colour, in XS…XXL order. */
  sizes: { size: Size; stock: number }[];
  size?: Size;
  /** Set once both colour and size are chosen. */
  variant?: Variant;
};

/**
 * Resolves ?color= and ?size= against a product. Unknown values are ignored:
 * colour falls back to the first one in stock, size stays unchosen (unless there is only one).
 */
export function selectVariant(p: Product, colorParam?: string, sizeParam?: string): Selection {
  const colors = [...new Map(p.variants.map((v) => [v.color.name, v.color])).values()];
  const hasStock = (c: Color) => p.variants.some((v) => v.color.name === c.name && v.stock > 0);
  const color =
    colors.find((c) => c.name.toLowerCase() === colorParam?.toLowerCase()) ?? colors.find(hasStock) ?? colors[0];

  const forColor = p.variants
    .filter((v) => v.color.name === color.name)
    .sort((a, b) => Size.options.indexOf(a.size) - Size.options.indexOf(b.size));
  const size = forColor.length === 1 ? forColor[0].size : forColor.find((v) => v.size === sizeParam?.toUpperCase())?.size;

  return {
    colors,
    color,
    sizes: forColor.map((v) => ({ size: v.size, stock: v.stock })),
    size,
    variant: forColor.find((v) => v.size === size),
  };
}
