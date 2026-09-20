import { describe, expect, it } from 'vitest';
import { parseSetlisten } from './setlisten';

describe('parseSetlisten', () => {
	it('groups Lieder by Datum, in row order', () => {
		const csv = `Datum,Liedtitel,Liedtext
2026-12-14,Stille Nacht,"Stille Nacht, heilige Nacht"
2026-12-14,O Tannenbaum,"O Tannenbaum, o Tannenbaum"
2026-01-05,Ruhrpott-Hymne,"Text vom Ruhrpott"
`;

		const result = parseSetlisten(csv);

		expect(result.get('2026-12-14')).toEqual([
			{ titel: 'Stille Nacht', text: 'Stille Nacht, heilige Nacht' },
			{ titel: 'O Tannenbaum', text: 'O Tannenbaum, o Tannenbaum' },
		]);
		expect(result.get('2026-01-05')).toEqual([{ titel: 'Ruhrpott-Hymne', text: 'Text vom Ruhrpott' }]);
	});

	it('preserves multi-line Liedtext', () => {
		const csv = `Datum,Liedtitel,Liedtext
2026-12-14,Stille Nacht,"Zeile eins\nZeile zwei"
`;

		const result = parseSetlisten(csv);

		expect(result.get('2026-12-14')?.[0].text).toBe('Zeile eins\nZeile zwei');
	});

	it('skips rows with a missing or invalid Datum', () => {
		const csv = `Datum,Liedtitel,Liedtext
not-a-date,Kaputt,Text
2026-03-01,Gültig,Text
`;

		const result = parseSetlisten(csv);

		expect(result.has('not-a-date')).toBe(false);
		expect(result.get('2026-03-01')).toEqual([{ titel: 'Gültig', text: 'Text' }]);
	});

	it('skips rows with a missing Liedtitel', () => {
		const csv = `Datum,Liedtitel,Liedtext
2026-03-01,,Text ohne Titel
`;

		expect(parseSetlisten(csv).has('2026-03-01')).toBe(false);
	});
});
