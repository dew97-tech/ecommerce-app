# TechNexus E-Commerce

A modern, high-performance full-stack e-commerce application built with **Next.js 16**, **Prisma**, and **Tailwind CSS**. This project features advanced product filtering, real-time search, secure authentication, and a responsive UI designed for a premium user experience.

## 🚀 Features

- **🛍️ Advanced Product Filtering**: Filter products by price range, brand, availability, and dynamic specifications (e.g., RAM, Processor) specific to categories.
- **🔍 Smart Search**: Real-time search bar with instant suggestions and debounced queries.
- **⚡ High Performance**: Built on Next.js App Router with Server Components and Suspense streaming for optimal speed and SEO.
- **🛒 Shopping Cart**: Fully functional shopping cart with persistent state management using Zustand.
- **🔐 Secure Authentication**: User login, signup, and profile management powered by NextAuth.js.
- **🎨 Modern UI/UX**:
    - **Responsive Design**: Mobile-first approach with a drawer navigation for smaller screens.
    - **Dark Mode**: Seamless light/dark mode toggling.
    - **Animations**: Smooth transitions and hover effects using Framer Motion and CSS.
    - **Components**: Built with ShadCN UI and Tailwind CSS.
- **📦 Database Management**: Robust data modeling with Prisma ORM and PostgreSQL.
- **🛠️ Admin Dashboard**: (Implied) Role-based access control for administrative tasks.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: JavaScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (Running instance)
- **Git**

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/technexus-ecommerce.git
cd technexus-ecommerce
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/technexus?schema=public"

# NextAuth Configuration
AUTH_SECRET="your-super-secret-key-at-least-32-chars" # Generate with: openssl rand -base64 32
```

### 3. Quick Start (Recommended)

We provide automated scripts to handle installation, database migration, and seeding.

**Windows:**
```batch
./run-app.bat
```

**Linux / macOS:**
```bash
chmod +x run-app.sh
./run-app.sh
```

These scripts will:
- Install dependencies (`npm install`).
- Push the Prisma schema to your database.
- Seed the database with initial product data (if not already seeded).
- Migrate legacy specification data to the new JSON format.
- Start the development server.

### 4. Manual Setup

If you prefer to run commands manually:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push Schema to Database
npx prisma db push

# Seed Database (Optional)
node scripts/seed-startech.js

# Migrate Specifications (Required for filters)
node scripts/migrate-specs.js

# Start Development Server
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication routes (login, signup)
│   ├── (public)/         # Public routes (products, cart, etc.)
│   ├── admin/            # Admin dashboard routes
│   ├── api/              # API routes
│   ├── globals.css       # Global styles and Tailwind directives
│   └── layout.js         # Root layout
├── components/           # Reusable UI components
│   ├── ui/               # ShadCN UI primitives
│   ├── products/         # Product-related components (Card, Sidebar, Toolbar)
│   └── ...
├── lib/                  # Utility functions and database client
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Database seeding and migration scripts
└── store/                # Global state stores (Zustand)
```

## 📜 Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the production server.
- **`npm run lint`**: Runs ESLint checks.
- **`node scripts/seed-startech.js`**: Seeds the database with products from `output.csv`.
- **`node scripts/migrate-specs.js`**: Parses HTML specifications into structured JSON for filtering.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
