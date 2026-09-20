import type { APIRoute } from 'astro';
import QRCode from 'qrcode';
import { getSetlistSeiten } from '../../lib/setlistSeiten';

export async function getStaticPaths() {
	const seiten = await getSetlistSeiten();
	return seiten.map((seite) => ({ params: { slug: seite.auftritt.slug } }));
}

export const GET: APIRoute = async ({ params, site }) => {
	const zielUrl = new URL(`/setlist/${params.slug}/`, site).toString();
	const png = await QRCode.toBuffer(zielUrl, { type: 'png', margin: 1, width: 512 });
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
};
