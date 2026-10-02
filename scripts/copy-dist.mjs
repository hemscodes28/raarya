import { cpSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '..');
const dist = join(projectRoot, 'dist');

for (const name of readdirSync(dist)) {
  const src = join(dist, name);
  const dest = join(projectRoot, name);
  try {
    cpSync(src, dest, { recursive: true, force: true });
  } catch (err) {
    console.warn(`[copy-dist note] Unable to overwrite locked file/folder (${name}):`, err.message);
  }
}

// Preserve dist/ directory for Capacitor native mobile build and package assets
