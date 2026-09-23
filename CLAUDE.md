## Agent skills

### Issue tracker

Issues live as GitHub issues on `ilolnxs/emscherspatzen`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily as domain modeling happens). See `docs/agents/domain.md`.

## Development

Static Astro site (build command `npm run build`, output directory `dist`, kein Astro-Cloudflare-Adapter). Deployed als Cloudflare Worker mit Static Assets (`wrangler.jsonc`) plus einem schlanken eigenen Worker-Skript (`src/worker.ts`) für die Live-Route `/api/auftritte`.

## Deployment

Live: https://emscherspatzen.marvin-grigg.workers.dev/ (Cloudflare, Auto-Deploy bei Push auf main).
`AUFTRITTE_SHEET_CSV_URL` muss im Workers-Projekt sowohl als Build-Variable (für `astro build`) als
auch als Laufzeit-Variable (für `src/worker.ts`) gesetzt sein. Details zur Homepage-Live-Route
siehe `docs/adr/0001-content-pipeline.md`, Nachtrag.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
