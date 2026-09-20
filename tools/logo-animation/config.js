/**
 * Alle Stellschrauben der Logo-Animation an einem Ort.
 *
 * Die Koordinaten beziehen sich auf das Koordinatensystem von
 * public/logo/emscherspatzen.svg. Die Ankerpunkte stammen aus der Außenkontur
 * des Vogels (Teilkontur 3 des dritten schwarzen Pfads); die Nummern in
 * Klammern sind die Punktindizes dieser Kontur.
 */

export const TIMING = {
	frames: 24,
	delayMs: 64, // 24 x 64 ms = 1,54 s Loop
	cycles: 2, // Flügelschwünge und Tweets pro Loop
	phase: 0.07, // verschiebt den Loop-Start auf einen kräftigen Einsatz
};

export const WING = {
	pivot: { x: 412.484375, y: 289.101562 }, // Punkt 85, Flügelansatz am Körper
	line: { x: 419.664062, y: 349.910156 }, // Punkt 106, Kerbe zum Schwanz
	band: 20, // Breite des weichen Übergangs zum Körper
	fade: 34,
	side: 1, // Flügel liegt rechts der Gelenklinie
	tMax: 1.3, // reicht bis über die zweite Zacke
	upDeg: 8,
	downDeg: 3,
};

export const BEAK = {
	pivot: { x: 373.351562, y: 172.25 }, // Punkt 68, Knick am Haubenansatz
	line: { x: 348.9375, y: 224.472656 }, // Punkt 46, Kehlwinkel
	band: 18,
	fade: 30,
	side: -1, // Schnabel liegt links der Gelenklinie
	tMax: 1.6, // schließt die Schnabelspitze ein
	upDeg: 4,
	attack: 0.12, // wie schnell der Schnabel hochschnappt
};

export const CHIRP = {
	origin: { x: 300, y: 185 }, // Schnabelspitze als Schallquelle
	pathIndices: [3, 4, 5, 12, 13, 14], // die sechs Zwitscher-Marken
	stagger: 0.1, // Versatz pro Ring, innen nach außen
	travel: 13, // wie weit eine Welle nach außen wandert
	decay: 3.8,
	attack: 0.06,
	minOpacity: 0.12,
	scalePop: 0.22,
};

/** Farbvarianten, die gebaut werden. Muss zu den Hintergründen der Seite passen. */
export const VARIANTS = [
	{ name: 'emscherspatzen-animiert.gif', ink: '#171b21', background: '#f7f7f4' },
	{ name: 'emscherspatzen-animiert-weiss.gif', ink: '#ffffff', background: '#0e2647' },
];

/**
 * Ausgabegröße und Farbtiefe. 440 px deckt den Hero (280 px CSS) auf Retina
 * weitgehend ab; 16 Farben reichen für eine Strichzeichnung mit Kantenglättung.
 * Zusammen landet eine Variante bei rund 190 kB — vergleichbar mit der
 * statischen SVG (135 kB), die sie ersetzt.
 */
export const OUTPUT = { width: 440, colors: 16 };
