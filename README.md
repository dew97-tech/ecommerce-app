# RigNexus E-Commerce

Full-stack e-commerce application for computer parts and custom PC builds, built with Next.js 16 (App Router), Prisma, MySQL and Tailwind CSS v4.

## Features

- Storefront with category browsing, product pages, search suggestions and dynamic specification filters
- PC Builder with slot-by-slot selection, live pricing, wattage estimate and compatibility checks
- Cart, checkout and order tracking with SSLCommerz payment integration
- NextAuth v5 authentication with an admin dashboard for products, categories, orders, banners, blogs, comments and reviews
- Catalog pipeline that crawls and syncs products, specifications and images

## Tech Stack

- Next.js 16 (App Router, Turbopack), React 19, JavaScript
- Prisma 5 + MySQL
- Tailwind CSS v4, shadcn-style primitives, lucide-react icons
- NextAuth v5, Zustand, zod, sonner

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

For production-style migrations use `npm run db:deploy` instead of `db:push`.

### Quick Start

`run-app.bat` (Windows) and `run-app.sh` (Linux/macOS) automate install, schema push, admin bootstrap, seeding and the dev server. They use `.seeded` and `.specs-migrated` marker files to skip work that already ran. Delete a marker to run that step again.

## Project Structure

```
app/                    Next.js App Router
  (auth)/               Login and signup
  (public)/             Storefront routes
  admin/                Admin dashboard
  api/                  Route handlers (auth, uploads, SSLCommerz)
components/
  admin/                Admin dashboard UI
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
  ui/                   shadcn-style UI primitives
lib/
  actions/              Server actions (admin, checkout, search, blog, reviews)
  auth/guards.js        Admin route guard
  catalog/              Queries, facets, specifications, nav data
  pc-builder/           Slot definitions, compatibility rules, quotation PDF
  seo/                  Structured data helpers
  services/             SSLCommerz client, image upload
  db.js                 Prisma client singleton
  utils.js, images.js, price.js, sanitize.js, product-parser.js, ...
prisma/                 Schema and migrations
public/                 Static assets and uploaded files
scripts/
  catalog/              Crawl -> sync pipeline and diagnostics
  seed/                 Seeders and admin bootstrap
  media/                Category tiles, banners, icons
  maintenance/          Backups, migrations, data fixes
store/                  Zustand stores (cart, PC builder, admin UI, category selection)
data/ backups/ reports/ Runtime artifacts, gitignored
docs/                   Topic guides (catalog refresh, category tiles)
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

### Maintenance

| Command | Purpose |
| --- | --- |
| `npm run products:clean-descriptions` | Strip scraped source links from product descriptions (`-- --dry-run`, `-- --limit=N`) |
| `npm run content:convert` | Convert legacy Markdown blog bodies to sanitized HTML (dry-run unless `-- --apply`) |

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
