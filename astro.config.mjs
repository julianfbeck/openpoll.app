import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import auth from 'auth-astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://openpoll.app',
  output: 'server',
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    auth(),
    react()
  ],
  adapter: node({
    mode: 'standalone'
  })
});
