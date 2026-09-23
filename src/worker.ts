/**
 * Eigener Worker neben den Static Assets (siehe wrangler.jsonc `main` +
 * `assets.binding`). Fängt nur /api/auftritte ab, alles andere geht an die
 * von astro build erzeugten statischen Dateien. Kein Astro-Cloudflare-
 * SSR-Adapter nötig — bleibt beim bestehenden Workers-Projekt und der
 * bestehenden URL, siehe docs/adr/0001-content-pipeline.md.
 */

interface Fetcher {
	fetch(request: Request): Promise<Response>;
}

interface Env {
	ASSETS: Fetcher;
	AUFTRITTE_SHEET_CSV_URL?: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/api/auftritte') {
			return handleAuftritte(env);
		}
		return env.ASSETS.fetch(request);
	},
};

async function handleAuftritte(env: Env): Promise<Response> {
	const csvUrl = env.AUFTRITTE_SHEET_CSV_URL;
	if (!csvUrl) return new Response('AUFTRITTE_SHEET_CSV_URL fehlt', { status: 500 });

	let res: Response;
	try {
		res = await fetch(csvUrl);
	} catch (err) {
		return new Response('Sheet nicht erreichbar: ' + (err as Error).message, { status: 502 });
	}
	if (!res.ok) return new Response('Sheet-Antwort ' + res.status, { status: 502 });

	const csv = await res.text();
	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Cache-Control': 'public, max-age=60',
		},
	});
}
