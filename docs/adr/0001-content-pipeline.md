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

## Nachtrag: Homepage-Terminliste läuft seit [Datum der Migration] live statt build-time

Die Startseiten-Liste (bevorstehende/vergangene Auftritte) wird nicht mehr beim Build gebacken,
sondern von einer Cloudflare Pages Function (`functions/api/auftritte.js`) live ausgeliefert und
client-seitig gerendert — analog zu thetequilaconnection. Grund: Diese Liste hat keinen Build-Time-
Zwang (anders als die Setlist/QR-Seiten unten) und musste nur wegen des Build-Time-Backens durch
einen nächtlichen Apps-Script-Trigger aktuell gehalten werden. Dieser nächtliche Trigger ist damit
überflüssig und kann im Sheet entfernt werden.

**Was unverändert bleibt:** Die Setlist/QR-Seiten (`src/pages/setlist/[slug].astro`,
`src/pages/qr/[slug].png.ts`) sind weiterhin zwingend Build-Time-Artefakte (`getStaticPaths` pro
Auftritt, physisch gedruckte QR-Codes) und brauchen weiterhin den Apps-Script-on-change-Trigger +
Deploy-Hook. Die im Kontext oben beschriebene Blackbox-Problematik (Trigger-Code lebt nur im
Sheet, nicht in Git) besteht für diesen Teil bewusst weiter — eine Ablösung war nicht Teil dieser
Änderung.

**Hosting-Wechsel:** Dafür musste die Seite von Cloudflare Workers Static Assets zurück auf
Cloudflare Pages umziehen, weil Pages Functions (anders als ein reiner Workers-Static-Assets-
Deploy) unabhängig von Astros Cloudflare-SSR-Adapter funktionieren — das ursprüngliche
Adapter-Doppel-Build-Problem (siehe oben) tritt dabei nicht auf, weil die Seite weiterhin komplett
statisch (`astro build`, kein Adapter) bleibt.
