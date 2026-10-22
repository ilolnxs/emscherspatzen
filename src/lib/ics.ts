import type { Auftritt } from './auftritte';

const DAUER_STUNDEN = 2;
const SEITE = 'https://emscherspatzen.de/auftritte';

function escape(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

// RFC 5545: Zeilen max. 75 Zeichen, Fortsetzung mit führendem Leerzeichen.
function fold(zeile: string): string {
	const teile = [zeile.slice(0, 75)];
	for (let i = 75; i < zeile.length; i += 74) teile.push(' ' + zeile.slice(i, i + 74));
	return teile.join('\r\n');
}

const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
const ymdhms = (d: Date) => d.toISOString().slice(0, 19).replace(/[-:]/g, '');

// Zeiten bewusst "floating" (ohne Zeitzone): Auftritte sind lokale Termine, das spart den VTIMEZONE-Block.
export function auftrittToIcs(a: Auftritt, jetzt: Date = new Date()): string {
	const start = new Date(`${a.datum}T${a.uhrzeit || '00:00'}:00Z`);
	const zeiten = a.uhrzeit
		? [`DTSTART:${ymdhms(start)}`, `DTEND:${ymdhms(new Date(start.getTime() + DAUER_STUNDEN * 3600_000))}`]
		: [`DTSTART;VALUE=DATE:${ymd(start)}`, `DTEND;VALUE=DATE:${ymd(new Date(start.getTime() + 86400_000))}`];

	const zeilen = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Emscherspatzen//Auftritte//DE',
		'CALSCALE:GREGORIAN',
		'BEGIN:VEVENT',
		`UID:${a.slug}@emscherspatzen.de`,
		`DTSTAMP:${ymdhms(jetzt)}Z`,
		...zeiten,
		`SUMMARY:${escape(a.titel)}`,
		...(a.ort ? [`LOCATION:${escape(a.ort)}`] : []),
		...(a.beschreibung ? [`DESCRIPTION:${escape(a.beschreibung)}`] : []),
		`URL:${SEITE}`,
		'END:VEVENT',
		'END:VCALENDAR',
	];
	return zeilen.map(fold).join('\r\n') + '\r\n';
}
