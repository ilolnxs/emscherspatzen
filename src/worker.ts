/**
 * Eigener Worker neben den Static Assets (siehe wrangler.jsonc `main` +
 * `assets.binding`). Fängt nur /api/auftritte und /api/termin.ics ab, alles andere geht an die
 * von astro build erzeugten statischen Dateien. Kein Astro-Cloudflare-
 * SSR-Adapter nötig — bleibt beim bestehenden Workers-Projekt und der
 * bestehenden URL, siehe docs/adr/0001-content-pipeline.md.
 */

import { parseAuftritte } from './lib/auftritte';
import { auftrittToIcs } from './lib/ics';

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
		if (url.pathname === '/api/termin.ics') {
			return handleTerminIcs(env, url.searchParams.get('id') ?? '');
		}
		return env.ASSETS.fetch(request);
	},
};

async function ladeCsv(env: Env): Promise<{ csv: string } | { fehler: Response }> {
	const csvUrl = env.AUFTRITTE_SHEET_CSV_URL;
	if (!csvUrl) return { fehler: new Response('AUFTRITTE_SHEET_CSV_URL fehlt', { status: 500 }) };

	let res: Response;
	try {
		res = await fetch(csvUrl);
	} catch (err) {
		return { fehler: new Response('Sheet nicht erreichbar: ' + (err as Error).message, { status: 502 }) };
	}
	if (!res.ok) return { fehler: new Response('Sheet-Antwort ' + res.status, { status: 502 }) };
	return { csv: await res.text() };
}

// Nur echte Sheet-Einträge werden zur .ics, keine frei konstruierbaren Termine.
async function handleTerminIcs(env: Env, id: string): Promise<Response> {
	const geladen = await ladeCsv(env);
	if ('fehler' in geladen) return geladen.fehler;

	const auftritt = parseAuftritte(geladen.csv).find((a) => a.slug === id);
	if (!auftritt) return new Response('Termin nicht gefunden', { status: 404 });

	return new Response(auftrittToIcs(auftritt), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="${auftritt.slug}.ics"`,
			'Cache-Control': 'public, max-age=60',
		},
	});
}

async function handleAuftritte(env: Env): Promise<Response> {
	const geladen = await ladeCsv(env);
	if ('fehler' in geladen) return geladen.fehler;

	return new Response(geladen.csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Cache-Control': 'public, max-age=60',
		},
	});
}
