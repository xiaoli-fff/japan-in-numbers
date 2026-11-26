// Japan in Numbers — entry program (Node 22, standard library only).
//
// The site lives in this repository's app/ folder: plain static files the
// browser opens at app/index.html (ES modules, one stylesheet, no build
// step). Its content is in its own files, so nothing it runs, styles or
// shows loads over the network.
//
// This program hands the entry in. It copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json — the
// summary the judge reads (the screenshots, the first load's files and
// bytes, and the source) — using the vendored make.fun library.
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer
// rebuilds the dossier with its own copy and requires the two to match
// byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function fail(message) {
  throw new Error(`japan-in-numbers main.ts: ${message}`);
}

// The entry is not complete without the site and its screenshots: refuse
// to write a half-empty /output instead of handing one in.
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
const shots = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => statSync(join(shotsDir, name)).isFile())
  : [];
if (shots.length < 3 || shots.length > 4) {
  fail(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}
for (const name of shots) {
  if (!/\.(png|jpe?g)$/i.test(name)) fail(`screenshot ${name} is not a PNG or JPEG`);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files and
// directories in app/, or more than 16 MiB of app files. app/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
