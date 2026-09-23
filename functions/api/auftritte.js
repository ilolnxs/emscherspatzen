export async function onRequestGet(context) {
  const url = context.env.AUFTRITTE_SHEET_CSV_URL;
  if (!url) return new Response('AUFTRITTE_SHEET_CSV_URL fehlt', { status: 500 });

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    return new Response('Sheet nicht erreichbar: ' + err.message, { status: 502 });
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
