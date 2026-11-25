import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';

// L'hébergeur donne l'adresse publique à la compilation (domaine personnalisé compris) : Netlify avec URL, Vercel avec l'autre
const { NETLIFY, URL: URL_NETLIFY, VERCEL_PROJECT_PRODUCTION_URL } = process.env;
const ADRESSE = NETLIFY && URL_NETLIFY ? URL_NETLIFY : `https://${VERCEL_PROJECT_PRODUCTION_URL || 'localhost:4321'}`;

export default defineConfig({
  site: ADRESSE,
  build: { format: 'file' }, // garde les adresses du site : /tarifs.html, /contact.html…
  devToolbar: { enabled: false },
  integrations: [react({ include: ['**/react/**'] }), vue()],
});
