# RigNexus E-Commerce

Full-stack e-commerce application for computer parts and custom PC builds, built with Next.js 16 (App Router), Prisma, MySQL and Tailwind CSS v4. Production domain: `rignexus.com.bd`.

## Features

- Storefront with category browsing, product pages, search suggestions, dynamic specification filters and related products
- PC Builder with slot-by-slot selection, live pricing, wattage estimate, compatibility checks and a quotation PDF
- Cart and checkout with server-validated stock on every add/update and atomic stock reservation inside a single transaction
- Idempotent checkout (`checkoutToken`) so retries and resubmits cannot create duplicate orders or charges
- SSLCommerz payments with verified success/fail/cancel/IPN callbacks and an in-flight guard against starting a second payment session
- Order lifecycle: `PENDING -> PROCESSING -> SHIPPED -> DELIVERED`, with `FAILED` for payment failures and terminal `CANCELLED`
- Customer order cancellation before processing begins, with a required reason and optional note; cancellations are visible to admins and stock is released automatically
- Admin dashboard for products, categories, orders (search, KPI cards, auto-save status and cancellation reasons), banners, blogs, comments, reviews and content
- Catalog pipeline that crawls and syncs products, specifications and images
- Cached catalog reads (listings, facets, navigation, sitemap) backed by tuned MySQL indexes

## Tech Stack

- Next.js 16 (App Router, Turbopack), React 19, JavaScript
- Prisma 5 + MySQL 8
- Tailwind CSS v4, shadcn-style primitives, lucide-react icons
- NextAuth v5 (JWT sessions), Zustand, zod, sonner

## Requirements

- Node.js 20.9 or newer (22 LTS recommended)
- MySQL 8 (or MariaDB 10.4+)
- Git

## Environment Setup

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce_db"
AUTH_SECRET="<generate-a-strong-secret>"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

STORE_ID="<sslcommerz-store-id>"
STORE_PASSWORD="<sslcommerz-store-password>"
IS_LIVE="false"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="<strong-password-min-8-chars>"
ADMIN_NAME="Admin"
```

Optional variables (see `.env.example` for the full list):

- `GEMINI_API_KEY` — powers category tile image generation (`npm run tiles:generate`)
- `GEMINI_TEXT_MODEL` — text model for generated article prose (default `gemini-2.5-flash`)
- `GEMINI_BRAIN_DIR` — folder with images produced by the Gemini/Antigravity IDE (`npm run tiles:sync`)

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database Setup

```bash
npm install
npm run db:push        # create/sync tables from prisma/schema.prisma
npm run promote-admin  # create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD
npm run seed           # import products from data/source/output.csv
npm run seed:specs     # flatten specifications into filterable attributes
npm run dev
```

For production-style migrations use `npm run db:deploy`, which applies the committed migrations in `prisma/migrations`.

### Quick Start

`run-app.bat` (Windows) and `run-app.sh` (Linux/macOS) automate install, schema push, admin bootstrap, seeding and the dev server. They use `.seeded` and `.specs-migrated` marker files to skip work that already ran. Delete a marker to run that step again.

## Orders, Stock and Payments

Order lifecycle and cancellation rules:

- **Statuses**: `PENDING` (placed, unpaid or awaiting payment) -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`. `FAILED` means the payment attempt failed; `CANCELLED` is terminal and cannot be reopened, even by an admin.
- **Stock**: decremented atomically when an order is placed, using a guarded `updateMany` (`stock >= quantity`) inside one transaction, so two buyers can never oversell the last unit. If any line fails, the whole order rolls back and no payment is initiated.
- **Stock release**: stock is restored when an order is cancelled before shipment (`PENDING`, `PROCESSING` or `FAILED`) by the customer, an admin or the payment gateway. `SHIPPED` and `DELIVERED` cancellations do not touch stock.
- **Customer cancellation**: available while the order is `PENDING` or `FAILED` and unpaid. The customer must choose a reason (plus an optional note) and the cancellation appears in the admin dashboard with `cancelledBy`, `cancelledAt`, `cancellationReason` and `cancellationNote`. Once processing starts the action is disabled.
- **Duplicate charge protection**: the checkout form carries a unique `checkoutToken`; a retry returns the existing order instead of creating another. SSLCommerz initiation is refused with `409 PAYMENT_IN_PROGRESS` while a payment session is live, and success/IPN handlers are idempotent. A payment callback for a cancelled order records the payment fields but never revives the order status.

## Caching and Performance

Catalog reads are cached with `unstable_cache` and invalidated by tags (`products`, `categories`, `nav`, `banners`, `blogs`, `reviews`) from the admin actions:

| Layer | TTL |
| --- | --- |
| Listings + product counts, product detail, home | 60s |
| Facets | 120s |
| Navigation, category tree, blogs | 300s |
| Sitemap (chunked to stay under the 2 MB cache entry limit) | 300s |

The Product table uses composite indexes leading with `availabilityStatus, isActive` for storefront listings and sorting, plus `stock, isActive` for low-stock admin queries. After bulk catalog syncs, refresh optimizer statistics so MySQL keeps choosing the right indexes:

```bash
mysql -h 127.0.0.1 -u <user> -p ecommerce_db -e "ANALYZE TABLE Product;"
```

## Project Structure

```
app/                    Next.js App Router
  (auth)/               Login and signup
  (public)/             Storefront routes (home, products, categories, cart, checkout, orders, blogs, PC builder)
  admin/                Admin dashboard
  api/                  Route handlers (auth, uploads, SSLCommerz)
components/
  admin/                Admin dashboard UI (tables, forms, dialogs, status controls)
  auth/                 Login and signup forms
  blog/                 Blog comments
  cart/                 Cart view
  catalog/              Listing filters, facets, category tiles
  checkout/             Checkout form
  common/               Providers, theme toggle, content renderers, avatar
  contact/              Contact form
  home/                 Home page sections
  layout/
    header/             Header, search, mega menu, navbar container
    footer/             Footer
  orders/               Order status timeline
  pc-builder/           Builder shell, slot list, summary, wattage meter
  product/              Product card, gallery, details, tabs, related products
  profile/              Profile form and avatar upload
  reviews/              Ratings and review forms
  seo/                  JSON-LD structured data
  ui/                   shadcn-style UI primitives (button, dialog, select, tooltip, ...)
lib/
  actions/              Server actions (admin, cart, checkout, orders, search, blog, reviews)
  auth/guards.js        Session-based guards (JWT claims, no per-action DB lookup)
  cache/config.js       Cache tags and TTLs
  catalog/              Listing queries and cache, facets, selects, nav data
  content/              Blog generation and insights helpers
  orders/stock.js       Stock restore helpers shared by checkout and cancellations
  pc-builder/           Slot definitions, compatibility rules, quotation PDF
  security/             Rate limiting
  seo/                  Structured data helpers
  services/             SSLCommerz client, image upload
  db.js                 Prisma client singleton
  format.js             Date, payment method and cancellation formatters
  price.js, images.js, sanitize.js, product-parser.js, search-query.js, utils.js,
  use-is-mounted.js, site-config.js
prisma/                 Schema and migrations
proxy.js                NextAuth middleware (route protection)
public/                 Static assets and uploaded files
scripts/
  catalog/              Crawl -> sync pipeline and diagnostics
  seed/                 Seeders and admin bootstrap
  media/                Category tiles, banners, icons
  maintenance/          Backups, migrations, data fixes
  content/              Scheduled publishing and reporting
store/                  Zustand stores (cart, PC builder, admin UI, category selection)
docs/                   catalog-refresh.md, category-tiles.md, deployment-cookbook.md
data/ backups/ reports/ Runtime artifacts, gitignored
run-app.bat, run-app.sh One-shot local setup scripts
connect.bat             SSH helper for the production host
```

## Commands

### Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |

### Database

| Command | Purpose |
| --- | --- |
| `npm run db:push` | Push `schema.prisma` to the database (development) |
| `npm run db:deploy` | Apply committed Prisma migrations |
| `npm run db:studio` | Open Prisma Studio at `localhost:5555` |
| `npm run db:backup` | Dump the database to `backups/<db>-<timestamp>.sql` (requires `mysqldump`) |

### Seeding and Admin

| Command | Purpose |
| --- | --- |
| `npm run seed` | Import products from `data/source/output.csv` (skips existing product codes unless `-- --force`) |
| `npm run seed:specs` | Flatten product specifications into filterable attributes |
| `npm run seed:banners` | Seed the default banner campaigns |
| `npm run seed:content` | Seed sample blog posts |
| `npm run promote-admin` | Create the admin user from `.env` (never overwrites a password) |
| `npm run admin:reset-password` | Create or reset an admin password (`-- --email --password`) |

### Catalog Pipeline

| Command | Purpose |
| --- | --- |
| `npm run catalog:crawl` | Crawl the source sitemap into `data/catalog` |
| `npm run catalog:sync` | Import crawl output into MySQL (dry-run by default) |
| `npm run catalog:refresh` | Run crawl then sync |
| `npm run catalog:audit-images` | Report products with suspect image lists |
| `npm run catalog:filter-images` | Detect and remove polluted image entries (`-- --apply` to write) |
| `npm run catalog:audit-sync` | Diff crawl output against the database |
| `npm run catalog:repair-images` | Re-fetch pages and repair broken image lists |

See `docs/catalog-refresh.md` for flags and workflows.

### Media

| Command | Purpose |
| --- | --- |
| `npm run tiles:generate` | Generate category tile images via the Gemini API (`GEMINI_API_KEY`) |
| `npm run tiles:sync` | Copy Gemini IDE output into `assets/` |
| `npm run tiles:optimize` | Convert `assets/category_*.jpg` to `public/categories/*.webp` |
| `npm run tiles:seed` | Assign category images from `public/categories` |
| `npm run tiles:list` | Report categories without a tile |
| `npm run banners:optimize` | Convert `assets/banner_*.jpg` to responsive WebP |
| `npm run icons:generate` | Regenerate favicon, Apple icon and manifest sizes from `app/icon.svg` |

See `docs/category-tiles.md` for the tile workflow.

### Maintenance and Content

| Command | Purpose |
| --- | --- |
| `npm run products:clean-descriptions` | Strip scraped source links from product descriptions (`-- --dry-run`, `-- --limit=N`) |
| `npm run content:convert` | Convert legacy Markdown blog bodies to sanitized HTML (dry-run unless `-- --apply`) |
| `npm run content:publish` | Publish scheduled blog posts whose time has passed |
| `npm run content:report` | Generate a content inventory report for review |

## Deployment

See **[docs/deployment-cookbook.md](docs/deployment-cookbook.md)** for the full production walkthrough: domain and DNS (BTCL), an ExonHost VPS, Coolify, GitHub auto-deploy, MySQL restore, persistent uploads, HTTPS and SSLCommerz go-live.

At a glance: push to `master` -> Coolify builds the Nixpacks app -> `npx prisma migrate deploy` runs before release -> uploads persist at `/srv/rignexus/uploads` -> Traefik terminates HTTPS.

## Data and Artifact Folders

These folders are gitignored and hold runtime data:

- `data/source/output.csv` — source product CSV used by `npm run seed`
- `data/catalog` — crawl runs consumed by `npm run catalog:sync`
- `backups` — database dumps
- `reports` — sync, tile and repair reports
- `assets` — generated tile and banner images before optimization
- `public/uploads` — user-uploaded images served by the app

## Viewing the Database

Connection details live in `DATABASE_URL` inside `.env` (default: host `localhost`, port `3306`, database `ecommerce_db`).

### Prisma Studio (recommended)

```bash
npm run db:studio
```

Opens a browser UI at `http://localhost:5555` with all tables and rows.

### Beekeeper Studio

1. New connection -> MySQL.
2. Host: `127.0.0.1` (prefer this over `localhost` on Windows), Port: `3306`.
3. User and password: the values in `DATABASE_URL`.
4. Set **Default Database** to `ecommerce_db` (if this is empty, Beekeeper opens `information_schema` and no app tables appear).
5. Connect and expand `ecommerce_db` -> Tables.

Tables: `banner`, `blog`, `category`, `comment`, `order`, `orderitem`, `pricehistory`, `product`, `review`, `user`, `variant`, `_prisma_migrations`.

If no tables show up:

- Confirm the Default Database field is `ecommerce_db`, not blank.
- Try `127.0.0.1` instead of `localhost`; a second MySQL instance (for example XAMPP on another port) may be answering.
- Verify from a terminal:

```bash
mysql -h 127.0.0.1 -P 3306 -u <user> -p ecommerce_db -e "SHOW TABLES;"
```

- Check the Beekeeper connection user has privileges on `ecommerce_db`.

## Verification

Run before shipping any change:

```bash
npm run lint
npm run build
```
