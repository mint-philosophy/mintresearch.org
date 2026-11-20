// Rebuild the Data Dash module used by the static page (not the website's Astro routes).
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const original = new URL('src/pages-archive/data-dash-original.astro', root);
const staticPage = new URL('public/data-dash/index.html', root);
const code = (await readFile(original, 'utf8')).match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!code) throw new Error('Data Dash entry script not found in the Astro archive');

const { outputFiles } = await build({
  stdin: {
    contents: code,
    loader: 'ts',
    sourcefile: 'data-dash-entry.ts',
    resolveDir: fileURLToPath(new URL('.', original)),
  },
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'esm',
  target: ['es2022'],
  write: false,
  legalComments: 'eof',
});

const assets = 'assets/data-dash-game.js';
const hash = createHash('sha256').update(outputFiles[0].contents).digest('hex').slice(0, 12);
const html = await readFile(staticPage, 'utf8');
const old = /src="\/(?:_astro\/data-dash\.astro_astro_type_script_index_0_lang\.[\w-]+\.js|assets\/data-dash-game\.js\?v=[a-f0-9]+)"/g;
if ([...html.matchAll(old)].length !== 1) throw new Error('Expected one Data Dash script reference');
await writeFile(new URL(`public/${assets}`, root), outputFiles[0].contents);
await writeFile(staticPage, html.replace(old, `src="/${assets}?v=${hash}"`));
console.log(`Data Dash: /${assets}?v=${hash}`);
