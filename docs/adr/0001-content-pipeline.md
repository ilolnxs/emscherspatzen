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
sondern von einem eigenen Worker-Fetch-Handler (`src/worker.ts`, Route `/api/auftritte`) live
ausgeliefert und client-seitig gerendert — analog zu thetequilaconnection. Grund: Diese Liste hat
keinen Build-Time-Zwang (anders als die Setlist/QR-Seiten unten) und musste nur wegen des
Build-Time-Backens durch einen nächtlichen Apps-Script-Trigger aktuell gehalten werden. Dieser
nächtliche Trigger ist damit überflüssig und kann im Sheet entfernt werden.

**Was unverändert bleibt:** Die Setlist/QR-Seiten (`src/pages/setlist/[slug].astro`,
`src/pages/qr/[slug].png.ts`) sind weiterhin zwingend Build-Time-Artefakte (`getStaticPaths` pro
Auftritt, physisch gedruckte QR-Codes) und brauchen weiterhin den Apps-Script-on-change-Trigger +
Deploy-Hook. Die im Kontext oben beschriebene Blackbox-Problematik (Trigger-Code lebt nur im
Sheet, nicht in Git) besteht für diesen Teil bewusst weiter — eine Ablösung war nicht Teil dieser
Änderung.

**Kein Hosting-Wechsel:** Ein Umzug auf Cloudflare Pages wurde geprüft und verworfen, weil er ein
neues Projekt und eine neue URL bedeutet hätte — nicht gewollt. Cloudflare Workers erlaubt
stattdessen einen eigenen `main`-Worker neben den Static Assets (`wrangler.jsonc`: `"main":
"src/worker.ts"` + `assets.binding: "ASSETS"`), der nur `/api/auftritte` selbst behandelt und alles
andere über `env.ASSETS.fetch(request)` durchreicht. Kein Astro-Cloudflare-SSR-Adapter nötig — das
ursprüngliche Adapter-Doppel-Build-Problem (siehe oben) betrifft nur den SSR-Adapter, nicht einen
eigenen Static-Assets-Worker. Bestehendes Projekt, bestehende URL, bestehender Deploy-Hook bleiben
unverändert; einzig `AUFTRITTE_SHEET_CSV_URL` muss zusätzlich als Laufzeit-Variable (nicht nur als
Build-Variable) im Workers-Projekt eingetragen werden.
