# Product photo prompts

One prompt per mock product (`src/mocks/products.ts`), in the same style as the hero (CLAUDE.md §8.1).

## How to deliver

1. Generate each image (e.g. with Astra). Vertical **4:5**, at least **1600 px tall**.
2. Save it in the repo root, named after the product slug (the file name in each heading below, e.g. `trench.png`; `.jpg` / `.webp` are fine too).
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

### `canvas-tote.png`: Canvas Tote (Woman, ivory)
> Still-life studio photograph of a single heavy natural canvas tote bag in ivory, standing upright on the floor, centred, long handles up and slightly relaxed, soft fabric folds, no print or label. *+ shared style*, except the bag fills about 70% of the height.

### `overshirt.png`: Wool Overshirt (Man, stone)
> Full-body studio fashion photograph of one man standing straight and centred, facing camera. A heavy brushed-wool overshirt in stone beige with two chest pockets, worn open like a light jacket over an ivory t-shirt, straight navy trousers, minimal white sneakers. *+ shared style*

### `fine-knit-sweater.png`: Fine-Knit Sweater (Woman, grey)
> Full-body studio fashion photograph of one woman standing in a relaxed pose, facing camera. A fine merino crew-neck sweater in warm grey with a relaxed body and long ribbed cuffs, tucked loosely into stone wide-leg trousers, minimal black loafers. *+ shared style*

### `wool-blazer.png`: Wool Blazer (Woman, black)
> Full-body studio fashion photograph of one woman standing straight and centred, facing camera. A long, slightly oversized single-breasted black wool blazer, buttoned once, over a fine ivory knit, straight stone trousers, minimal black loafers. *+ shared style*

### `oxford-shirt.png`: Oxford Shirt (Man, ivory)
> Full-body studio fashion photograph of one man standing straight and centred, facing camera. A washed ivory oxford cotton button-down shirt with a soft collar, sleeves rolled once, untucked over grey pleated trousers, minimal white sneakers. *+ shared style*

### `straight-denim.png`: Straight Denim (Man, navy)
> Full-body studio fashion photograph of one man standing in a relaxed three-quarter pose, facing camera. Rigid dark navy denim jeans with a mid rise and a straight full-length leg, no visible branding, worn with a tucked-in ivory t-shirt and minimal white sneakers. Focus on the jeans. *+ shared style*

### `pleated-trousers.png`: Pleated Trousers (Man, grey)
> Full-body studio fashion photograph of one man standing in a relaxed three-quarter pose, facing camera. Double-pleated grey wool trousers with a relaxed thigh and tapered leg, worn with a tucked-in fine black knit and minimal black leather shoes. Focus on the trousers. *+ shared style*

### `cap.png`: Cotton Cap (Woman, stone)
> Still-life studio photograph of a single six-panel cap in stone washed cotton twill, three-quarter view, resting on the floor, no logo or label. *+ shared style*, except the cap fills about 50% of the height.

### `leather-belt.png`: Leather Belt (Woman, black)
> Still-life studio photograph of a single narrow black leather belt with a plain brushed silver buckle, loosely coiled on the floor, no branding. *+ shared style*, except the belt fills about 50% of the height.

### `beanie.png`: Ribbed Beanie (Woman, grey)
> Still-life studio photograph of a single deep-ribbed wool beanie in warm grey with a folded cuff, standing upright on the floor, no label. *+ shared style*, except the beanie fills about 50% of the height.

### `merino-scarf.png`: Merino Scarf (Woman, burgundy)
> Still-life studio photograph of a long, light merino scarf in deep burgundy (#6E1E2B), loosely folded and draped on the floor with soft folds, finished edges, no label. *+ shared style*, except the scarf fills about 60% of the height.

### `card-holder.png`: Leather Card Holder (Man, black)
> Still-life studio photograph of a single slim black leather card holder, lying flat at a slight angle on the floor, no logo or stamp. *+ shared style*, except the card holder fills about 35% of the height.

### `canvas-backpack.png`: Canvas Backpack (Man, stone)
> Still-life studio photograph of a single clean backpack in stone waxed cotton canvas with tan leather straps, standing upright on the floor, front view, no logo or label. *+ shared style*, except the backpack fills about 65% of the height.

### `knit-tie.png`: Knit Tie (Man, navy)
> Still-life studio photograph of a single navy square-end silk knit tie, loosely laid in a gentle S-curve on the floor, no label. *+ shared style*, except the tie fills about 60% of the height.

### `wool-socks.png`: Ribbed Wool Socks (Man, grey)
> Still-life studio photograph of one pair of mid-calf ribbed merino socks in warm grey, laid flat side by side on the floor, no label. *+ shared style*, except the socks fill about 55% of the height.

## Later

- One photo per colour (e.g. the coat in stone, the tee in black) when we want the image to follow the colour picker.
