/**
 * Baut die animierten Logo-GIFs aus public/logo/emscherspatzen.svg.
 *
 *   npm run logo:animate
 *
 * Die Original-SVG wird nur gelesen, nie verändert. Für jedes Frame werden die
 * Pfadpunkte gewichtet gedreht (siehe deform.js), die Zwitscher-Marken bekommen
 * eine wandernde Schallwelle. Stellschrauben stehen in config.js.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import gifenc from 'gifenc';
import { makeJoint, deformPath } from './deform.js';
import { TIMING, WING, BEAK, CHIRP, VARIANTS, OUTPUT } from './config.js';

const { GIFEncoder, quantize, applyPalette } = gifenc;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const sourceSvg = resolve(repoRoot, 'public/logo/emscherspatzen.svg');

const svg = readFileSync(sourceSvg, 'utf-8');
const viewBox = svg.match(/viewBox="([^"]*)"/)[1];
const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);

const pathRe = /<path fill-rule="nonzero" fill="([^"]*)" fill-opacity="1" d="([^"]*)"\/?>/g;
const inkPaths = [];
let match;
while ((match = pathRe.exec(svg))) {
	if (match[1] === 'rgb(0%, 0%, 0%)') inkPaths.push(match[2]);
}
const birdIndex = 2; // der Vogel inkl. aller Teilkonturen
const bird = inkPaths[birdIndex];

const wingJoint = makeJoint({
	ax: WING.pivot.x, ay: WING.pivot.y, bx: WING.line.x, by: WING.line.y,
	band: WING.band, fade: WING.fade, side: WING.side, tMax: WING.tMax,
});
const beakJoint = makeJoint({
	ax: BEAK.pivot.x, ay: BEAK.pivot.y, bx: BEAK.line.x, by: BEAK.line.y,
	band: BEAK.band, fade: BEAK.fade, side: BEAK.side, tMax: BEAK.tMax,
});

/** Mittelpunkt und Abstrahlrichtung jeder Zwitscher-Marke. */
const marks = CHIRP.pathIndices
	.map((index) => {
		const numbers = inkPaths[index].match(/-?\d+\.?\d*/g).map(Number);
		const xs = numbers.filter((_, i) => i % 2 === 0);
		const ys = numbers.filter((_, i) => i % 2 === 1);
		const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
		const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
		const dx = cx - CHIRP.origin.x;
		const dy = cy - CHIRP.origin.y;
		const r = Math.hypot(dx, dy);
		return { index, cx, cy, ux: dx / r, uy: dy / r, r };
	})
	.sort((a, b) => a.r - b.r)
	.map((mark, rank) => ({ ...mark, rank }));

const frac = (x) => x - Math.floor(x);
const envelope = (local, attack) =>
	Math.min(1, local / attack) * Math.exp(-CHIRP.decay * Math.max(0, local - attack));

function frameSvg(t, { ink, background }) {
	const swing = Math.sin(2 * Math.PI * TIMING.cycles * t);
	const wingAngle = swing >= 0 ? -WING.upDeg * swing : WING.downDeg * -swing;
	const beakAngle = -BEAK.upDeg * envelope(frac(t * TIMING.cycles + TIMING.phase), BEAK.attack);

	const deformed = deformPath(bird, [
		{ joint: wingJoint, pivotX: WING.pivot.x, pivotY: WING.pivot.y, angleDeg: wingAngle },
		{ joint: beakJoint, pivotX: BEAK.pivot.x, pivotY: BEAK.pivot.y, angleDeg: beakAngle },
	]);

	const chirps = marks
		.map((mark) => {
			const local = frac(t * TIMING.cycles - mark.rank * CHIRP.stagger + TIMING.phase);
			const env = envelope(local, CHIRP.attack);
			const opacity = CHIRP.minOpacity + (1 - CHIRP.minOpacity) * env;
			const ox = mark.ux * CHIRP.travel * local;
			const oy = mark.uy * CHIRP.travel * local;
			const scale = 1 - CHIRP.scalePop / 2 + CHIRP.scalePop * env;
			const transform =
				`translate(${ox.toFixed(2)} ${oy.toFixed(2)}) translate(${mark.cx} ${mark.cy}) ` +
				`scale(${scale.toFixed(3)}) translate(${-mark.cx} ${-mark.cy})`;
			return `<path fill-rule="nonzero" d="${inkPaths[mark.index]}" fill="${ink}" opacity="${opacity.toFixed(3)}" transform="${transform}"/>`;
		})
		.join('');

	// Übrige unbewegte Tuschepfade (Schriftzug bleibt außen vor: nur der Vogelbereich)
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${vbW}" height="${vbH}">
		<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${background}"/>
		<path fill-rule="nonzero" d="${deformed}" fill="${ink}"/>
		${chirps}
		${inkPaths
			.map((d, i) => (i === birdIndex || CHIRP.pathIndices.includes(i) ? '' : `<path fill-rule="nonzero" d="${d}" fill="${ink}"/>`))
			.join('')}
	</svg>`;
}

for (const variant of VARIANTS) {
	const gif = GIFEncoder();
	let width = 0;
	let height = 0;

	for (let i = 0; i < TIMING.frames; i++) {
		const rendered = new Resvg(frameSvg(i / TIMING.frames, variant), {
			fitTo: { mode: 'width', value: OUTPUT.width },
		}).render();
		width = rendered.width;
		height = rendered.height;
		const rgba = rendered.pixels;
		const palette = quantize(rgba, OUTPUT.colors);
		gif.writeFrame(applyPalette(rgba, palette), width, height, { palette, delay: TIMING.delayMs });
	}

	gif.finish();
	const target = resolve(repoRoot, 'public/logo', variant.name);
	writeFileSync(target, Buffer.from(gif.bytes()));
	const kb = (Buffer.from(gif.bytes()).length / 1024).toFixed(0);
	console.log(`${variant.name}: ${width}x${height}, ${TIMING.frames} Frames, ${kb} kB`);
}
