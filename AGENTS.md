# AGENTS.md

Guidance for AI-assisted work in this repository. Read this before changing any UI. The admin surface must look hand-built and consistent, not generated.

## 1. Project snapshot

- Next.js 16 App Router + React 19, JavaScript (no TypeScript).
- Prisma 5 + MySQL. Schema in `prisma/schema.prisma`, client in `lib/db.js`.
- Tailwind CSS v4 configured in `app/globals.css` (no `tailwind.config`).
- Auth: NextAuth v5 (`auth.js`); admin routes guarded in `app/admin/layout.js` via `requireAdmin()` in `lib/auth/guards.js`.
- Routes: `app/` storefront, `app/admin/` admin.
- Shared primitives: `components/ui/` (shadcn-style). Admin components: `components/admin/`.
- Server actions: `lib/actions/*.js` (for example `lib/actions/admin-products.js`, `lib/actions/admin-orders.js`).
- Icons: `lucide-react`. Toasts: `sonner`. Forms use `zod` and `react-hook-form` where already established.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run db:push`, `npm run db:deploy`, `npm run db:studio`, `npm run seed`.

## 2. Commands

Run these before finishing any change:

- `npm run lint`
- `npm run build`

Do not consider a task done while either command fails.

## 3. Admin design language

Mandatory for `app/admin/**` and `components/admin/**`.

Colors and tokens:

- Use semantic tokens only: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `text-destructive`, `bg-primary`, `text-success`, `text-warning`, `text-price`.
- Never hardcode hex, rgb, or Tailwind palette colors (`red-500`, `purple-600`, `#1d4ed8`) outside `app/globals.css`.
- Use token radius `rounded-lg` (`--radius: 0.5rem`); never `rounded-3xl`.

Panels:

- Panels are `rounded-lg border border-border bg-card`.
- Group sections with `FormPanel` (`components/admin/form-panel.jsx`); its header is `text-sm font-semibold` and body is `p-5`.
- Use `AdminPageHeader` for page titles and `EmptyState` for empty lists.
- Sticky layers: topbar is `sticky top-0 h-16 z-40`; page-level action bars are `sticky top-16 z-30`.

Fields:

- Wrap inputs in `FormField` with label above and hint or error below; render errors with `FieldError`.
- Mark required fields (`required` prop) and set `required` on the input.
- Set `aria-invalid` on invalid inputs and associate the error text.

Layout:

- Admin pages are full-width workspaces with `p-4 md:p-6` and `space-y-6` between panels.
- Multi-field forms use two-column grids (`grid gap-4 md:grid-cols-2`); field grids use `gap-4`.
- Complex editors use a main column plus right rail: `xl:grid-cols-[minmax(0,1fr)_360px]`.

Actions:

- Exactly one primary submit per screen.
- Secondary actions use `variant="outline"` or `variant="ghost"`.
- Icon-only buttons require both `aria-label` and `title`.
- Destructive actions use a confirmation dialog (`ProductDeleteButton` / `DeleteConfirmationDialog` pattern).

Feedback:

- Field errors inline via `FieldError`; outcomes via `toast` from `sonner` (`toast.success`, `toast.error`).
- Never use a bare red `<p>` for a top-level failure.
- Show pending state on submit (`useFormStatus` or local `isSubmitting`).

Reuse before creating: `FormPanel`, `FormField`, `FieldError`, `AdminPageHeader`, `EmptyState`, `ImageField`, `RichTextEditor`, `ProductDeleteButton`, `StatusBadge`, `AdminPagination`, `AdminSearch`.

## 4. Do not ship these AI-looking patterns

- Centered narrow single-column forms (`max-w-2xl mx-auto`) for data-heavy workflows.
- Gradient text or backgrounds, glow, glassmorphism, purple/indigo palettes, decorative blobs.
- Emoji in UI copy, sparkle or magic icons, exclamation-heavy microcopy.
- An icon on every label; oversized hero cards inside admin tools.
- Card-inside-card nesting without a functional reason.
- `rounded-3xl`, large drop shadows (`shadow-2xl`), long transition animations.
- Inventing new UI primitives or adding dependencies when `components/ui` already covers the need.

## 5. Consistency rules

- Match the file being edited: quotes (`"` in `components/admin`, `'` in `lib`), semicolons, and JSX spacing as written.
- Reuse existing components before creating new ones; do not duplicate primitives in `components/ui`.
- Do not add comments unless the file already uses them.
- Server actions used with `useActionState` return plain serializable objects (`{ message, errors, success }`) for client form state; see `lib/actions/admin-products.js`.
- Keep `'use server'` at the top of action files and revalidate affected paths.

## 6. Verification

For every UI change:

- `npm run lint` and `npm run build` must pass.
- Manually check responsive widths 375 / 768 / 1024 / 1440 and dark mode (`.dark`).
- Confirm no console errors or React hydration warnings.
- Verify sticky offsets do not overlap: topbar `top-0 h-16`, page action bars `top-16`.
