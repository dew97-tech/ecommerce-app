# Catalog Refresh Pipeline

Keeps the product catalog in sync with the source store (startech.com.bd):
prices, discounts, availability, brands, categories, images, specifications and
descriptions. Removed products are archived (never hard-deleted) so order and
review history stays intact.

## How it works

1. **Crawl** — reads the source sitemap, fetches every URL once and classifies it:
   - product page → `products.jsonl` (SKU, price, status, brand, breadcrumb,
     images, specifications, key features, description).
   - category listing page → `listings.jsonl` + `categories.jsonl`
     (per-tile price/stock snapshots).
2. **Sync** — matches source products to the database by `productCode`
   (`product:retailer_item_id`), then:
   - updates price / discounted price (old price becomes strikethrough),
     status, brand (normalized), images, specs, category path, source URL;
   - inserts new products that have a price;
   - archives products that no longer exist at the source
     (`isActive=false`, `sourceStatus=MISSING`);
   - records every price change in `PriceHistory`;
   - writes reviewable CSV/JSON reports.

All crawls and applies are **resumable** — stop any time with `Ctrl+C` and
re-run the same command to continue where it left off.

## Prerequisites

- `.env` with `DATABASE_URL`.
- Network access to the source.
- `npm install` (uses `cheerio` as a dev tool).

## Commands

```bash
# 0. Backup before any apply
npm run db:backup

# 1. Pilot (fast validation, ~40 products)
npm run catalog:crawl -- --run=pilot --products=40
npm run catalog:sync -- --run=pilot            # dry-run report

# 2. Full crawl (resumable, ~26k URLs; safe to stop and restart)
npm run catalog:crawl -- --run=full

# 3. Dry-run sync against the full run (no database writes)
npm run catalog:sync -- --run=full

# 4. Review reports, then apply
npm run catalog:sync -- --run=full --apply --archive-missing
```

`catalog:refresh` chains crawl + sync in one command and forwards the same
flags (`--run=`, `--products=`, `--limit=`, `--apply`, `--archive-missing`,
`--concurrency=`, `--delay=`, `--retry-errors`).

### Verification & repair

```bash
# Compare the database against a crawl snapshot (read-only)
npm run catalog:audit-sync

# Product image pollution audit and optional live probe
npm run catalog:audit-images
npm run catalog:audit-images -- --probe=5

# Re-fetch galleries for suspect products (resumable, writes a CSV report and
# keeps a products.jsonl.bak before rewriting crawl images)
npm run catalog:repair-images -- --apply --update-crawl-data
```

`catalog:audit-sync` checks price, discount, availability, stock and image
consistency against the run and should report zero mismatches after every
apply.

### Useful flags

| Flag | Applies to | Meaning |
| --- | --- | --- |
| `--run=NAME` | crawl / sync | Run folder name (defaults to newest crawl) |
| `--products=N` | crawl | Stop after N products (pilot mode) |
| `--limit=N` | crawl | Only process the first N sitemap URLs |
| `--concurrency=N` | crawl | Parallel workers (default 2) |
| `--delay=MS` | crawl | Delay per worker between requests (default 1100) |
| `--retry-errors` | crawl | Re-fetch URLs that previously failed |
| `--fresh` | crawl | Ignore existing checkpoints and start over |
| `--apply` | sync | Write changes (default is dry-run) |
| `--resume` | sync | Continue an interrupted apply |
| `--archive-missing` | sync | Archive DB products absent from the source. **Only use after a full crawl** |

## Data & reports

```
data/catalog/runs/<run>/
  manifest.json     sitemap URLs
  products.jsonl    parsed product snapshots
  listings.jsonl    category listing snapshots (tiles)
  categories.jsonl  category page index
  errors.jsonl      404s / failures
  state.json        crawl checkpoint (resumable)
  sync-state.json   apply checkpoint (resumable)

reports/catalog-sync/<run>-<timestamp>/
  summary.json
  price-changes.csv
  new-products.csv
  removed.csv
```

These folders are gitignored.

## Safety rules

- Always run a dry run and review the reports before `--apply`.
- Always run `npm run db:backup` before applying.
- `--archive-missing` must only be used after a complete crawl, otherwise
  products that simply were not visited yet would be archived.
- Archived products are hidden from the storefront but remain linked to past
  orders and reviews.
- `npm run seed` (imports `output.csv`) is **bootstrap-only**: existing
  products are skipped so it can never overwrite synced prices, stock, images
  or categories. Use `npm run seed -- --force` only for an intentional
  overwrite, then re-run `catalog:sync` to restore source data.
- Products without a usable source price stay archived on sync; matched
  products keep their stored price and discount when the source has none.

## Scheduling (ongoing)

Windows Task Scheduler / cron can run a light weekly refresh:

```bash
npm run db:backup
npm run catalog:crawl -- --run=weekly
npm run catalog:sync -- --run=weekly --apply --archive-missing
```

For faster price-only checks, `listings.jsonl` from a full crawl already
contains per-category tile prices and stock, which can update prices without
fetching every product page.
