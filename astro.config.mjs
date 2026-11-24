import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://site-point-pro.vercel.app',
  build: { format: 'file' }, // garde les adresses actuelles : /tarifs.html, /contact.html…
  integrations: [react({ include: ['**/react/**'] }), vue()],
});
