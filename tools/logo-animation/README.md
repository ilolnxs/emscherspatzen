# Logo-Animation

Erzeugt die animierten Vereinslogos aus `public/logo/emscherspatzen.svg`.

```sh
npm run logo:animate
```

Schreibt nach `public/logo/`:

| Datei | Verwendung |
|---|---|
| `emscherspatzen-animiert.gif` | heller Hintergrund (Header) |
| `emscherspatzen-animiert-weiss.gif` | Vereinsblau (Hero, Footer) |

## Warum verformt und nicht geschnitten wird

Das Logo ist eine **Strichzeichnung**: Jeder sichtbare Strich besteht aus einer
Außen- und einer Gegenkontur innerhalb desselben Pfads, die Strichoptik entsteht
erst durch die Füllregel `nonzero`. Schneidet man ein Teil heraus, um es zu
drehen, reißt die Linie an der Schnittkante sichtbar auf.

Deshalb wird nichts geschnitten, sondern **gewichtet gedreht** (`deform.js`):
Jeder Punkt bekommt ein Gewicht zwischen 0 und 1, abhängig von seiner Lage zu
einer Gelenklinie. Am Körper ist das Gewicht 0, an der Spitze 1, dazwischen
liegt ein weicher Übergang — die Verbindungslinie biegt sich also, statt zu
brechen. Die Originaldatei wird dabei ausschließlich gelesen.

## Die beiden Gelenke

| | Flügel | Schnabel |
|---|---|---|
| Drehpunkt | Punkt 85, Flügelansatz | Punkt 68, Knick am Haubenansatz |
| Gelenklinie bis | Punkt 106, Kerbe zum Schwanz | Punkt 46, Kehlwinkel |
| bewegte Seite | rechts | links |
| Ausschlag | −8° hoch / +3° runter | −4° hoch, auf den Zwitscher-Einsatz |

Unbewegt bleiben Kopfkuppel, Hals, Rumpf, Beine, Schwanz-Zacke und der
Schriftzug. Die Gewichte lassen sich prüfen, indem man `weight()` aus
`deform.js` auf einen Punkt anwendet — 0 heißt „steht still", 1 „dreht voll mit".

## Anpassen

Alle Stellschrauben stehen in `config.js`:

- **Tempo**: `TIMING.frames` und `TIMING.delayMs` (Produkt = Loop-Dauer),
  `TIMING.cycles` = Schwünge pro Loop
- **Ausschlag**: `WING.upDeg` / `WING.downDeg`, `BEAK.upDeg`
- **Übergangsweichheit**: `band` (quer zur Gelenklinie) und `fade` (entlang);
  größere Werte = weicherer, breiterer Übergang
- **Gesang**: `CHIRP.travel` (Wegstrecke der Schallwelle), `CHIRP.stagger`
  (Versatz zwischen den Ringen), `CHIRP.decay` (Ausklingen)
- **Größe und Gewicht**: `OUTPUT.width`, `OUTPUT.colors`

## Achtung bei Farbänderungen

GIF kann keine weiche Transparenz, deshalb ist der Seitenhintergrund in die
Dateien **eingebacken**. Die Werte in `VARIANTS` müssen zu `--papier` und
`--blau-dunkel` aus `src/styles/global.css` passen. Ändert sich dort eine Farbe,
muss `npm run logo:animate` erneut laufen.
