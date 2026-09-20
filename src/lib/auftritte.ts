import Papa from 'papaparse';

export interface Auftritt {
	slug: string;
	datum: string;
	titel: string;
	ort: string;
	beschreibung: string;
}

const DATUM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Wandelt rohe Sheet-Zeilen (CSV mit Spalten Datum, Titel, Ort, Beschreibung)
 * in strukturierte Auftritt-Objekte um. Zeilen mit fehlendem/ungültigem Datum
 * oder fehlendem Titel werden übersprungen statt den Build abzubrechen, da
 * das Sheet von nicht-technischen Personen gepflegt wird.
 */
export function parseAuftritte(csv: string): Auftritt[] {
	const { data } = Papa.parse<Record<string, string>>(csv, {
		header: true,
		skipEmptyLines: true,
	});

	const auftritte: Auftritt[] = [];

	for (const row of data) {
		const datum = row.Datum?.trim() ?? '';
		const titel = row.Titel?.trim() ?? '';
		const ort = row.Ort?.trim() ?? '';
		const beschreibung = row.Beschreibung?.trim() ?? '';

		if (!DATUM_PATTERN.test(datum)) {
			console.warn(`Auftritt übersprungen: ungültiges Datum "${datum}" (Titel: "${titel}")`);
			continue;
		}
		if (!titel) {
			console.warn(`Auftritt übersprungen: kein Titel (Datum: "${datum}")`);
			continue;
		}

		auftritte.push({
			slug: `${datum}-${slugify(titel)}`,
			datum,
			titel,
			ort,
			beschreibung,
		});
	}

	return auftritte;
}

export function splitByZeitpunkt(
	auftritte: Auftritt[],
	heute: Date = new Date()
): { bevorstehende: Auftritt[]; vergangene: Auftritt[] } {
	const heuteIso = heute.toISOString().slice(0, 10);

	const bevorstehende = auftritte
		.filter((a) => a.datum >= heuteIso)
		.sort((a, b) => a.datum.localeCompare(b.datum));

	const vergangene = auftritte
		.filter((a) => a.datum < heuteIso)
		.sort((a, b) => b.datum.localeCompare(a.datum));

	return { bevorstehende, vergangene };
}
