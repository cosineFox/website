# Canvas Labworks

Photography portfolio + personal site for Clement (Klang Valley, Malaysia).

## Stack
- SvelteKit + Svelte 5 runes
- Plain CSS (no animation libraries)
- Vercel deployment

## Routes
- `/main` - personal intro, Bluesky feed, Steam games, visitor counter
- `/imageworks` - photography gallery (Bluesky posts filtered by #photography)
- `/maker` - projects showcase (GitHub repos)
- `/maker/dashboard` - weather dashboard (Open-Meteo + USGS earthquake data)

## API Routes
- `/api/steam` - proxies Steam API for recently played games
- `/api/counter` - file-based visitor counter

## Rules
- Svelte 5 runes only (`$state`, `$props`, `$effect`, `$derived`). No Svelte 4 syntax.
- Server data in `+page.server.ts`, access via `let { data } = $props()`
- Keep it simple - this site uses plain CSS, no animation libs

## External APIs
- Bluesky: `public.api.bsky.app` (feed integration)
- Steam: proxied through `/api/steam`
- Open-Meteo: weather + air quality
- USGS: earthquake data
- Status.cafe: online status
