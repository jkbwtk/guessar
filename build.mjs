import { build } from 'esbuild';
import { Dirent, readdirSync } from 'fs';
import { join } from 'path';


const srcdir = './src/ts';
const outdir = 'public/js';
const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');
const excludedFiles = [
  /^[A-Z].+$/,
  /^utils.ts$/,
];

/**
 * @param {Dirent} file
 * @return {boolean}
 */
const entryPointFilter = (file) => {
  if (!file.isFile()) return false;

  return !excludedFiles.some((regex) => regex.test(file.name));
};

const entryPoints = readdirSync(srcdir, { withFileTypes: true })
  .filter(entryPointFilter)
  .map((file) => join(srcdir, file.name));

build({
  logLevel: 'info',
  bundle: true,
  minify: true,
  sourcemap: false,
  target: [
    'ES2015',
  ],

  loader: {
    '.glsl': 'text',
  },

  watch: watchMode,
  incremental: watchMode,

  entryPoints,
  outdir,
});
