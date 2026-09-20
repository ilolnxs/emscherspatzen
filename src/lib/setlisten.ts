import Papa from 'papaparse';

export interface Lied {
	titel: string;
	text: string;
}

const DATUM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Wandelt rohe Sheet-Zeilen (CSV mit Spalten Datum, Liedtitel, Liedtext) in
 * Lieder gruppiert nach Auftritt-Datum um, in Zeilenreihenfolge (= Reihenfolge
 * im Programm). Zeilen mit fehlendem/ungültigem Datum oder fehlendem
 * Liedtitel werden übersprungen statt den Build abzubrechen.
 */
export function parseSetlisten(csv: string): Map<string, Lied[]> {
	const { data } = Papa.parse<Record<string, string>>(csv, {
		header: true,
		skipEmptyLines: true,
	});

	const lieder = new Map<string, Lied[]>();

	for (const row of data) {
		const datum = row.Datum?.trim() ?? '';
		const titel = row.Liedtitel?.trim() ?? '';
		const text = row.Liedtext?.trim() ?? '';

		if (!DATUM_PATTERN.test(datum)) {
			console.warn(`Lied übersprungen: ungültiges Datum "${datum}" (Liedtitel: "${titel}")`);
			continue;
		}
		if (!titel) {
			console.warn(`Lied übersprungen: kein Liedtitel (Datum: "${datum}")`);
			continue;
		}

		const gruppe = lieder.get(datum) ?? [];
		gruppe.push({ titel, text });
		lieder.set(datum, gruppe);
	}

	return lieder;
}
