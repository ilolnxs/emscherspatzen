import { parseAuftritte, type Auftritt } from './auftritte';
import { parseSetlisten, type Lied } from './setlisten';

export interface SetlistSeite {
	auftritt: Auftritt;
	lieder: Lied[];
}

/**
 * Lädt Auftritte und Setlisten (je eigenes Google Sheet) und führt sie über
 * das gemeinsame Datum zu Setlist-Seiten zusammen. Ein Auftritt ohne
 * passende Lieder bekommt keine Seite (kein Sinn in einem QR-Code ins
 * Leere). Netzwerk-/Konfigurationsfehler führen zu einer leeren Liste statt
 * den Build abzubrechen.
 */
export async function getSetlistSeiten(): Promise<SetlistSeite[]> {
	const auftritteUrl = process.env.AUFTRITTE_SHEET_CSV_URL;
	const setlistenUrl = process.env.SETLISTEN_SHEET_CSV_URL;

	if (!auftritteUrl || !setlistenUrl) {
		console.warn(
			'AUFTRITTE_SHEET_CSV_URL oder SETLISTEN_SHEET_CSV_URL ist nicht gesetzt – es werden keine Setlist-Seiten erzeugt.'
		);
		return [];
	}

	try {
		const [auftritteResponse, setlistenResponse] = await Promise.all([fetch(auftritteUrl), fetch(setlistenUrl)]);

		if (!auftritteResponse.ok || !setlistenResponse.ok) {
			console.warn(
				`Setlist-Daten konnten nicht geladen werden (Auftritte: HTTP ${auftritteResponse.status}, Setlisten: HTTP ${setlistenResponse.status}).`
			);
			return [];
		}

		const auftritte = parseAuftritte(await auftritteResponse.text());
		const liederProDatum = parseSetlisten(await setlistenResponse.text());

		const seiten: SetlistSeite[] = [];
		for (const auftritt of auftritte) {
			const lieder = liederProDatum.get(auftritt.datum);
			if (lieder && lieder.length > 0) {
				seiten.push({ auftritt, lieder });
			}
		}
		return seiten;
	} catch (error) {
		console.warn(`Setlist-Daten konnten nicht geladen werden: ${error}`);
		return [];
	}
}
