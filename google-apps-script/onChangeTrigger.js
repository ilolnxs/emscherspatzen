/**
 * Löst bei jeder Änderung am Auftritte-Sheet einen Cloudflare-Rebuild aus.
 * Siehe docs/adr/0001-content-pipeline.md.
 *
 * Einrichtung im Google Sheet:
 * 1. Erweiterungen > Apps Script öffnen, diese Datei hier einfügen.
 * 2. CLOUDFLARE_DEPLOY_HOOK_URL unten durch die echte Deploy-Hook-URL ersetzen.
 * 3. Uhr-Symbol (Trigger) links > Trigger hinzufügen:
 *    Funktion "onChange", Ereignisquelle "Aus Tabelle", Ereignistyp "Bei Änderung".
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
