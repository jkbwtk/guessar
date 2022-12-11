import { build } from 'esbuild';
import { Dirent, readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({
  override: false,
});


const doSourcemap = process.env.ES_SOURCEMAP === 'true';
const doMinify = process.env.ES_MINIFY !== 'false';

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
  minify: doMinify,
  sourcemap: doSourcemap,
  target: [
    'ES2020',
  ],

  loader: {
    '.glsl': 'text',
  },

  watch: watchMode,
  incremental: watchMode,

  entryPoints,
  outdir,
});
