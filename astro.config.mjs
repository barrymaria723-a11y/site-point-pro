import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';

// Vercel donne l'adresse publique du projet au moment de la compilation (domaine personnalisé compris)
const ADRESSE = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost:4321'}`;

export default defineConfig({
  site: ADRESSE,
  build: { format: 'file' }, // garde les adresses du site : /tarifs.html, /contact.html…
  devToolbar: { enabled: false },
  integrations: [react({ include: ['**/react/**'] }), vue()],
});
