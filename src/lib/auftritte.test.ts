import { describe, expect, it } from 'vitest';
import { parseAuftritte, splitByZeitpunkt } from './auftritte';

const csv = `Datum,Titel,Ort,Beschreibung
2026-12-14,Weihnachtssingen,Niederrheinstadion,"Der Klassiker, mit Punsch und Publikum"
2026-01-05,Feierabendbier,Bottroper Brauerei,Kleiner Auftritt zum Jahresstart
`;

describe('parseAuftritte', () => {
	it('parses rows into structured Auftritt objects', () => {
		const result = parseAuftritte(csv);

		expect(result).toEqual([
			{
				slug: '2026-12-14-weihnachtssingen',
				datum: '2026-12-14',
				titel: 'Weihnachtssingen',
				ort: 'Niederrheinstadion',
				beschreibung: 'Der Klassiker, mit Punsch und Publikum',
			},
			{
				slug: '2026-01-05-feierabendbier',
				datum: '2026-01-05',
				titel: 'Feierabendbier',
				ort: 'Bottroper Brauerei',
				beschreibung: 'Kleiner Auftritt zum Jahresstart',
			},
		]);
	});

	it('skips rows with a missing or invalid Datum', () => {
		const withBadRow = `Datum,Titel,Ort,Beschreibung
not-a-date,Kaputter Auftritt,Nirgendwo,
2026-03-01,Gültiger Auftritt,Irgendwo,
`;

		const result = parseAuftritte(withBadRow);

		expect(result).toHaveLength(1);
		expect(result[0].titel).toBe('Gültiger Auftritt');
	});

	it('skips rows with a missing Titel', () => {
		const withBadRow = `Datum,Titel,Ort,Beschreibung
2026-03-01,,Irgendwo,
`;

		expect(parseAuftritte(withBadRow)).toHaveLength(0);
	});

	it('builds URL-safe slugs from Umlauts and special characters', () => {
		const withUmlaut = `Datum,Titel,Ort,Beschreibung
2026-05-01,Grönemeyer-Tribut & Chöre!,Örtchen,
`;

		expect(parseAuftritte(withUmlaut)[0].slug).toBe('2026-05-01-groenemeyer-tribut-choere');
	});
});

describe('splitByZeitpunkt', () => {
	it('splits into bevorstehende (ascending) and vergangene (descending)', () => {
		const heute = new Date('2026-06-01');
		const auftritte = parseAuftritte(
			`Datum,Titel,Ort,Beschreibung
2026-12-14,Spätester,Ort,
2026-01-05,Vergangen 1,Ort,
2026-07-01,Nächster,Ort,
2025-11-01,Vergangen 2,Ort,
`
		);

		const { bevorstehende, vergangene } = splitByZeitpunkt(auftritte, heute);

		expect(bevorstehende.map((a) => a.titel)).toEqual(['Nächster', 'Spätester']);
		expect(vergangene.map((a) => a.titel)).toEqual(['Vergangen 1', 'Vergangen 2']);
	});
});
