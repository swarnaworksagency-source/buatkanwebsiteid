# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — start dev server (Next.js 16, React 19)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config, `eslint-config-next`)

No test runner configured. Repo is Windows / PowerShell by default.

## What this is

**BuatkanWeb.id** — Indonesian-language SaaS. UMKM (small businesses) fill out a 3-step wizard → AI generates a one-page marketing website → user edits inline → pays to deploy to a subdomain. No coding, no prompting required on the user side. All user-facing strings and most code comments are in Bahasa Indonesia.

## Architecture

### Core flow

1. **`/buat`** (`app/buat/page.tsx`) — ~900-line client component. 3-step wizard collects `FormData` (see `types/index.ts`), then POSTs to `/api/generate`. Draft state persisted to `localStorage` via `lib/storage.ts` (`safeStorage`). Loading an existing site uses `?id=<websiteId>`.

2. **`/api/generate`** (`app/api/generate/route.ts`) — calls Anthropic (`@anthropic-ai/sdk`, model `claude-sonnet-4-5`) and **streams raw text** back. System + user prompts instruct the model to return **pure JSON** (no markdown fences) matching `TemplateData` AI fields. Client accumulates the stream and `JSON.parse`s it.

3. **Live preview / inline edit** — `components/templates/jasa/TemplateSatu.tsx` renders the generated site. Single template ("jasa" = services). Props `isEditable`/`isEditMode` toggle inline editing via `components/ui/EditableText.tsx`. Same component renders both editor preview and final public page.

4. **Save** — writes a row to Supabase `websites` table. Images converted to WebP client-side (`lib/imageUtils.ts`) and uploaded to `website-assets` Supabase Storage bucket; public URLs stored back on the row.

5. **Deploy + pay** — `/api/payment/create` creates a Duitku invoice; user redirected to Duitku's hosted page. `/api/payment/webhook` verifies callback (MD5 signature: `merchantCode + amount + merchantOrderId + apiKey`) and flips website to `status: 'active'`.

6. **Public site** — `app/s/[subdomain]/page.tsx` fetches website by subdomain and renders `TemplateSatu` read-only, with full SEO metadata from `generated_content.seo`. Must stay `force-dynamic` / `revalidate = 0`.

7. **Template gallery** — `app/dashboard/template/` lets users browse templates. `app/preview/[templateId]/` accepts either a named template ID (e.g. `jasa-001`) or a UUID (loads real website data from Supabase). Embed mode via `?embed=true`.

### Subdomain routing (`proxy.ts`)

Multi-tenant via subdomains. Proxy (`proxy.ts`, formerly `middleware.ts` — renamed in Next 16) inspects `Host` header: `<sub>.buatkanweb.id` requests are **rewritten** to internal `/s/<sub>`. Main domain, `localhost`, `*.vercel.app`, and raw IPs fall through to Supabase session refresh. Configured via `NEXT_PUBLIC_MAIN_DOMAIN`.

### Data model (Supabase / Postgres)

Tables live in Supabase (not in-repo):

- **`websites`** — `id`, `user_id`, `subdomain`, `status` (`'draft'`/`'preview'`/`'active'`/`'expired'`), `nama_usaha`, `kategori`, `logo_url`, `foto_urls` (array), `generated_content` (jsonb), `expires_at`. `generated_content` holds full `TemplateData` AI output **plus** `__formData` snapshot to repopulate wizard on edit.
- **`payments`** — `order_id`, `website_id`, `user_id`, `harga`, `status`, `midtrans_status`. Columns still named `midtrans`/`snap_token` even though gateway is now **Duitku** — `snap_token` reused for Duitku transaction reference.
- **`generate_logs`** — analytics on AI generations.

Early-adopter pricing in `/api/payment/create`: first 75 active websites → Rp99.000; after → Rp199.000. Daily generation limit: 3 per user (`MAX_DAILY = 3` in `DashboardClient`).

### Supabase client conventions

Three distinct clients — pick the right one:
- `lib/supabase.ts` → `createClient()` — **browser** (`createBrowserClient`), used in client components.
- `lib/supabase-server.ts` → `createServerSupabaseClient()` — **server components / route handlers** with user's cookies (respects RLS).
- Raw `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` — **admin/bypass-RLS**, used only where there is no user session (payment webhook) or to bypass FK constraints (`/api/website/delete`). Never expose service-role key to client.

`components/AuthProvider.tsx` wraps the app and exposes `useAuth()` (`user`, `loading`, `signOut`). Auth is Supabase email/OAuth; OAuth callback is `app/auth/callback/route.ts`.

## Template System

Templates are registered centrally — never duplicate template metadata across files.

- **`lib/templates.ts`** — master registry: `CATEGORIES`, `TEMPLATES_BY_KATEGORI`, `AVAILABLE_TEMPLATES`, `KATEGORI_LABELS`. Import from here.
- **`lib/templateRegistry.tsx`** — maps `templateId → React component`. Add new templates here only. `getTemplateComponent(id)` returns the correct component.
- **`components/templates/<kategori>/Template*.tsx`** — one component per template. All must accept `Partial<TemplateData>` + `forceMobile`, `isEditable`, `isEditMode`, `onContentUpdate`, `websiteId`.

**Adding a new template:**
1. Create `components/templates/<kategori>/TemplateNama.tsx`
2. Add entry to `TEMPLATES_BY_KATEGORI` in `lib/templates.ts`
3. Add entry to `TEMPLATE_COMPONENTS` in `lib/templateRegistry.tsx`
4. Add to `AVAILABLE_TEMPLATES` in `lib/templates.ts`

Available: `jasa-001` (TemplateDua, "Klasik"), `jasa-002` (TemplateLima, "Neon" — dark + neon green, design ref `public/scene*.png`), `personal-001` (neo-brutalist/index.tsx), `personal-002` (brutalist-bento/index.tsx), `personal-003` (neon-grid/index.tsx). `jasa-005` (TemplateSatu, "Minimalist" — the original template) is coming_soon. FnB & Kreatif folders reserved for future.

## Types: the two contracts

`types/index.ts` defines two interfaces that tie the whole flow together:

- **`FormData`** — wizard input (3 steps: profil dasar, detail bisnis, visual & aset)
- **`TemplateData`** — render input (AI-generated fields + form-derived fields merged)

Changing the AI JSON shape means updating: the prompt in `/api/generate`, the `TemplateData` type, and `TemplateSatu`.

## Conventions

- **Path alias:** `@/*` maps to repo root.
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`), dark-first UI. Font: Montserrat via `next/font`. Icons: `lucide-react`.
- **Indonesian language** for all user-facing copy and validation messages.
- **Public pages must stay fresh:** `app/s/[subdomain]/page.tsx` sets `dynamic = 'force-dynamic'`, `revalidate = 0`, `fetchCache = 'force-no-store'`. Preserve these when touching that route.
- Reserved subdomains (blocked at deploy time): `www`, `api`, `admin`, `dashboard`, `app`, `buat`, `preview`, `auth`, `s`, and others — see `RESERVED_SUBDOMAINS` in `DashboardClient.tsx`.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (client + server)
- `SUPABASE_SERVICE_ROLE_KEY` — admin operations (webhook, delete). Server-only.
- `ANTHROPIC_API_KEY` — AI content generation
- `NEXT_PUBLIC_MAIN_DOMAIN` — apex domain for subdomain routing (default `buatkanweb.id`)
- `NEXT_PUBLIC_SITE_URL` — canonical app URL for auth redirects & payment callbacks
- `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_ENV` (`production` toggles sandbox vs prod endpoint)
