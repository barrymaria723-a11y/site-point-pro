import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';

// Vercel donne l'adresse publique du projet au moment de la compilation (domaine personnalisé compris)
const ADRESSE = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost:4321'}`;
const secret = () => envField.string({ context: 'server', access: 'secret', optional: true });

export default defineConfig({
  site: ADRESSE,
  devToolbar: { enabled: false },
  adapter: vercel(), // seules /admin et /api tournent sur le serveur, le reste est statique
  integrations: [react({ include: ['**/react/**'] }), vue()],
  env: { schema: { DATABASE_URL: secret(), ADMIN_MOT_DE_PASSE: secret(), SESSION_SECRET: secret() } },
});
