# ADR 0001: Content-Pipeline über Google Sheets + Cloudflare Pages Auto-Rebuild

## Status
Angenommen

## Kontext
Die Webseite (Auftritte, Setlisten/Liedtexte, ggf. weitere Texte) wird von nicht-technischen Chormitgliedern gepflegt (Norbert für allgemeine Inhalte, eine weitere Person für Liedtexte). Diese Person hatte ursprünglich "Webspace und Zugangsdaten" (klassischen FTP-Zugriff) angefragt — das passt nicht zu einem Git-basierten Cloudflare-Pages-Deployment. Zusätzliche Anforderung: Termin-Änderungen sollen die Webseite automatisch aktualisieren.

## Entscheidung
Alle Pflege-Inhalte werden in Google Sheets/Docs gepflegt — ein Werkzeug, das die Pflegenden bereits kennen. Ein Google-Apps-Script-Trigger löst bei jeder Sheet-Änderung einen Cloudflare-Pages-Deploy-Hook aus. Die Webseite wird mit Astro als Static-Site-Generator gebaut, der die Sheet-Daten beim Build abruft. Kein eigener Admin-Bereich, keine eigene Datenbank, keine separate Webspace-/FTP-Lösung.

## Begründung
- Erfüllt "automatisches Update bei Änderung" ohne eigenen Server oder Datenbank.
- Die ursprünglich angefragte FTP-Lösung wurde verworfen, nachdem sich herausstellte, dass die anfragende Person nicht technisch ist — "Webspace" war ihre Vorstellung, kein echter Bedarf.
- Alternative geprüft und verworfen: eigener Admin-Bereich mit Login, Formular und Datenspeicher — deutlich mehr Code/Wartungsaufwand für denselben Effekt.
- Ein QR-Code/eine Setlist-Seite existiert pro Auftritt (nicht pro Lied): QR-Codes werden vermutlich gedruckt, eine spätere Änderung der Granularität wäre mit Aufwand verbunden.

## Konsequenzen
- Einmaliger technischer Setup-Aufwand (Apps Script Trigger, Cloudflare Deploy Hook) liegt bei uns, nicht bei den Pflegenden.
- Änderungen erscheinen erst nach einem Build (ca. 1–2 Minuten), für Auftritts-Termine ausreichend aktuell.
- Die Struktur der Google Sheets muss stabil bleiben, damit der Build nicht bricht.
- Presseveröffentlichungen und Kontaktformular sind von dieser Entscheidung unberührt und bleiben offen.
