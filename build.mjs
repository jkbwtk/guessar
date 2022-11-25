import { build } from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';


const srcdir = './src/ts';
const outdir = 'public/js';
const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');
const excludedFiles = [
  /^[A-Z].+$/,
  /^utils.ts$/,
];

const entryPointFilter = (file) => {
  return !excludedFiles.some((regex) => regex.test(file));
};

const entryPoints = readdirSync(srcdir)
  .filter(entryPointFilter)
  .map((file) => join(srcdir, file));

build({
  logLevel: 'info',
  bundle: true,
  minify: true,
  sourcemap: false,
  target: [
    'ES2015',
  ],

  watch: watchMode,
  incremental: watchMode,

  entryPoints,
  outdir,
});
