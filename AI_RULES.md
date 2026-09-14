# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

<!-- cloudflare-pages:start -->

## Cloudflare Pages Functions Layer

This project uses Cloudflare Pages Functions for backend API routes. The `functions/` directory is the server runtime for Cloudflare Pages, and `wrangler.toml` configures the Pages build and bindings.

### vite.config.ts

`vite.config.ts` proxies `/api` requests to the local Wrangler Pages dev server at `http://localhost:8788` during development. The production frontend calls the Pages Functions endpoint configured by `VITE_API_URL`.

### API Route Conventions

- Write routes in `functions/api/`.
- Use Hono for API handlers and middleware.
- Dynamic routes use Hono's route syntax.
- Runtime bindings are accessed through the Cloudflare Pages Functions context.

### Imports — read carefully

- Hono is imported from `"hono"`.
- Server-only packages such as `postgres` and Supabase are used only from `functions/` or other server-side modules.
- Never import server-only packages or reference server-only environment variables from `src/`; client code is bundled for the browser.

### Common mistakes

- Do not create a separate Express, Nitro, or Node server for API routes.
- Do not import server-only packages from `src/`.
- Do not point the Vite proxy at `localhost:3000`; use the Wrangler Pages dev server on `localhost:8788`.
- Keep Pages Functions routes under `functions/api/`.

<!-- cloudflare-pages:end -->
