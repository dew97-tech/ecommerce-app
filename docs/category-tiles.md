# Category Tiles

Square (600x600) category visuals used on the home grid, the categories page,
category headers and subcategory cards. Categories without a tile fall back to
the SVG icon set in `components/catalog/category-icon.jsx`.

## Asset convention

- Source originals: `assets/category_<key>.jpg` (2048x2048 recommended)
- Optimized output: `public/categories/<key>.webp` (600x600, quality 80)
- `key` is the kebab-case category name. Duplicate names are disambiguated with
  the parent name: `Gaming > Mouse` = `gaming-mouse`,
  `Accessories > Mouse` = `accessories-mouse`.
- One exception: Graphics Card keeps the existing `gpu` key
  (`KEY_OVERRIDES` in `scripts/category-tile-convention.js`).
- Brand-only categories (ASUS, MSI, Logitech, ...) are skipped via
  `SKIP_BRAND_PATTERN`.

## Pipeline

```bash
npm run tiles:generate            # generate images (needs GEMINI_API_KEY)
npm run tiles:generate -- --list  # print next prompts without an API key
npm run tiles:sync                # copy images from GEMINI_BRAIN_DIR (manual batches)
npm run tiles:optimize            # assets/*.jpg -> public/categories/*.webp
npm run tiles:list                # write reports/category-tiles-pending.csv
npm run tiles:seed -- --apply     # set Category.image for existing webp files
```

`tiles:seed` is convention-based and idempotent: it only updates categories
whose `<key>.webp` file exists and whose `image` differs. Re-run it after any
catalog sync or new batch of assets.

Prompt template (see `buildPrompt` in the convention module):

> Studio product photo of {subject}, a single hero product centered on a
> seamless light-gray background, soft contact shadow, bright even lighting,
> photorealistic e-commerce style, no text, no logos, no people, no extra
> props. Square 1:1 composition, 2048x2048, JPEG.

## Notes

- `GEMINI_API_KEY` (free at https://aistudio.google.com/apikey) enables
  automatic generation. Without it, `--list` prints prompts for manual batches.
- Parked assets with no matching category are reported by `tiles:seed`
  (currently `peripherals`; no such category exists in the catalog).
- Category images are safe from catalog sync: `scripts/catalog/sync.js` only
  creates categories with `name`/`parentId` and never overwrites `image`.
- Admin overrides: category create/edit forms use the shared `ImageField`
  (URL or upload) and uploads land in `public/uploads/categories/`.
