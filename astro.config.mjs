import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';

// Le site tient sur une page : les anciennes adresses mènent à la bonne partie
const ANCIENNES = { index: 'accueil', entreprise: 'entreprise', activites: 'activites', briqueterie: 'briqueterie', tarifs: 'tarifs', 'location-transport': 'location', realisations: 'realisations', contact: 'contact' };
const secret = () => envField.string({ context: 'server', access: 'secret', optional: true });

export default defineConfig({
  site: 'https://site-point-pro.vercel.app',
  redirects: Object.fromEntries(Object.entries(ANCIENNES).map(([p, ancre]) => [`/${p}.html`, `/#${ancre}`])),
  devToolbar: { enabled: false },
  adapter: vercel(), // seules /admin et /api tournent sur le serveur, le reste est statique
  integrations: [react({ include: ['**/react/**'] }), vue()],
  env: { schema: { DATABASE_URL: secret(), ADMIN_MOT_DE_PASSE: secret(), SESSION_SECRET: secret() } },
});
