# Product photo prompts

One prompt per mock product (`src/mocks/products.ts`), in the same style as the hero (CLAUDE.md §8.1).

## How to deliver

1. Generate each image (e.g. with Astra). Vertical **4:5**, at least **1600 px tall**.
2. Save it in the repo root, named after the product slug: `trench.png`, `wide-leg-trousers.png`, `boxy-tee.png`, `heavyweight-hoodie.png`, `canvas-tote.png` (`.jpg` / `.webp` are fine too).
3. Tell Claude Code "product photos are in the root". It converts them to WebP in `public/assets/products/` and adds them to the products.

No cut-out is needed for product photos: the backdrop already matches the page.

## Shared style (keep it in every prompt)

> Seamless warm off-white studio backdrop, exactly #F4F1EC. Soft diffused daylight from the LEFT, faint floor shadow. 85mm lens, high-end catalogue look, muted warm-neutral grade. No text, no logos, no labels, no props. Vertical 4:5, subject centred and filling about 85% of the height, empty space left and right.

## Prompts

### `trench.png`: Cotton Trench (Woman, stone)
> Full-body studio fashion photograph of one woman standing straight and centred, facing camera, calm neutral expression, hair loose. A clean double-breasted cotton gabardine trench coat in stone beige (#D9D3C9), belted at the waist, collar down, worn over a fine ivory knit, straight black trousers, minimal black leather loafers. *+ shared style*

### `wide-leg-trousers.png`: Wide-Leg Trousers (Woman, stone)
> Full-body studio fashion photograph of one woman standing in a relaxed three-quarter pose, facing camera. High-waisted wide-leg trousers in stone beige wool with a single front pleat and a long, wide leg that touches the floor, worn with a tucked-in fine black knit top, minimal white sneakers. Focus on the drape of the trousers. *+ shared style*

### `boxy-tee.png`: Boxy Tee (Man, ivory)
> Full-body studio fashion photograph of one man standing straight and centred, facing camera, calm neutral expression, short hair. A heavyweight cotton t-shirt in ivory with a short, boxy, slightly cropped body and dropped shoulders, worn untucked over straight black trousers, minimal white sneakers. *+ shared style*

### `heavyweight-hoodie.png`: Heavyweight Hoodie (Man, grey)
> Full-body studio fashion photograph of one man standing straight and centred, facing camera, hood down. A heavyweight loopback cotton hoodie in warm mid-grey (#6B665F) with a double-layer hood and no drawstring hardware or graphics, worn with stone-coloured straight trousers and minimal white sneakers. *+ shared style*

### `canvas-tote.png`: Canvas Tote (Unisex, ivory)
> Still-life studio photograph of a single heavy natural canvas tote bag in ivory, standing upright on the floor, centred, long handles up and slightly relaxed, soft fabric folds, no print or label. *+ shared style*, except the bag fills about 70% of the height.

## Later

- One photo per colour (e.g. the coat in stone, the tee in black) when we want the image to follow the colour picker.
- The ~16-product launch catalogue (CLAUDE.md §6) needs the same treatment once the seed data exists.
