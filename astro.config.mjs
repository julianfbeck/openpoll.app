import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import auth from 'auth-astro';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://openpoll.app',
  output: 'server',
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    auth(),
    react(),
    mdx()
  ],
  adapter: cloudflare(),
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      wrap: true
    },
    extendDefaultPlugins: true
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});
