import { describe, expect, it } from 'vitest';
import { auftrittToIcs } from './ics';

const jetzt = new Date('2026-10-22T08:00:00Z');
const basis = { slug: '2026-12-14-weihnachtssingen', datum: '2026-12-14', uhrzeit: '18:00', titel: 'Weihnachtssingen', ort: 'Herne, Stadion', beschreibung: 'Mit Punsch' };

describe('auftrittToIcs', () => {
	it('erzeugt ein Termin mit Uhrzeit, 2 Stunden Dauer und stabiler UID', () => {
		const ics = auftrittToIcs(basis, jetzt);
		expect(ics).toContain('BEGIN:VCALENDAR\r\n');
		expect(ics).toContain('UID:2026-12-14-weihnachtssingen@emscherspatzen.de\r\n');
		expect(ics).toContain('DTSTART:20261214T180000\r\n');
		expect(ics).toContain('DTEND:20261214T200000\r\n');
		expect(ics).toContain('SUMMARY:Weihnachtssingen\r\n');
		expect(ics).toContain('LOCATION:Herne\\, Stadion\r\n');
		expect(ics).toContain('DTSTAMP:20261022T080000Z\r\n');
	});

	it('rollt über Mitternacht', () => {
		expect(auftrittToIcs({ ...basis, uhrzeit: '23:00' }, jetzt)).toContain('DTEND:20261215T010000\r\n');
	});

	it('macht Termine ohne Uhrzeit ganztägig', () => {
		const ics = auftrittToIcs({ ...basis, uhrzeit: '' }, jetzt);
		expect(ics).toContain('DTSTART;VALUE=DATE:20261214\r\n');
		expect(ics).toContain('DTEND;VALUE=DATE:20261215\r\n');
	});

	it('faltet lange Zeilen auf höchstens 75 Zeichen', () => {
		const ics = auftrittToIcs({ ...basis, beschreibung: 'x'.repeat(200) }, jetzt);
		for (const zeile of ics.split('\r\n')) expect(zeile.length).toBeLessThanOrEqual(75);
	});
});
