import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';


import tailwindcss from '@tailwindcss/vite';


// https://astro.build/config
export default defineConfig({
  // site: 'https://openpoll.app',
  site: 'https://openpoll.app',
  output: 'server',
  integrations: [react(), mdx()],
  adapter: cloudflare({
    platformProxy: true
  }),
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
    },
    plugins: [tailwindcss()]
  }
});