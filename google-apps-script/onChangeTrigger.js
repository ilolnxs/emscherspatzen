/**
 * Löst einen Cloudflare-Rebuild aus. Siehe docs/adr/0001-content-pipeline.md.
 *
 * Zwei Trigger rufen dieselbe Funktion auf:
 * - bei Änderung am Sheet, damit neue Auftritte sofort live gehen;
 * - täglich nachts, damit die Einteilung in bevorstehende/vergangene Auftritte
 *   nicht auf dem Datum des letzten Builds stehenbleibt. Ohne diesen zweiten
 *   Trigger stünde ein Auftritt bis zur nächsten Sheet-Änderung — im Schnitt
 *   ein bis zwei Wochen — weiter unter "Bevorstehende Auftritte".
 *
 * Einrichtung im Google Sheet:
 * 1. Erweiterungen > Apps Script öffnen, diese Datei hier einfügen.
 * 2. CLOUDFLARE_DEPLOY_HOOK_URL unten durch die echte Deploy-Hook-URL ersetzen.
 * 3. Uhr-Symbol (Trigger) links > Trigger hinzufügen, zweimal:
 *    a) Funktion "onChange", Ereignisquelle "Aus Tabelle", Ereignistyp "Bei Änderung".
 *    b) Funktion "onChange", Ereignisquelle "Zeitgesteuert", Typ "Tagestimer",
 *       Uhrzeit "3 bis 4 Uhr".
 */

const CLOUDFLARE_DEPLOY_HOOK_URL = 'HIER_DEPLOY_HOOK_URL_EINTRAGEN';

function onChange() {
	if (CLOUDFLARE_DEPLOY_HOOK_URL === 'HIER_DEPLOY_HOOK_URL_EINTRAGEN') {
		Logger.log('CLOUDFLARE_DEPLOY_HOOK_URL ist noch nicht gesetzt, siehe Kommentar oben.');
		return;
	}

	UrlFetchApp.fetch(CLOUDFLARE_DEPLOY_HOOK_URL, {
		method: 'post',
		muteHttpExceptions: true,
	});
}
