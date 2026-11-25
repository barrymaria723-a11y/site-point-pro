// Garde les adresses du site : tarifs/index.html devient tarifs.html
import { readdirSync, renameSync, existsSync, rmdirSync } from 'node:fs';
const base = '.vercel/output/static/';
for (const d of readdirSync(base)) {
  const page = `${base}${d}/index.html`;
  if (!d.includes('.') && existsSync(page)) { renameSync(page, `${base}${d}.html`); rmdirSync(base + d); }
}
