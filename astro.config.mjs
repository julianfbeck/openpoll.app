import { defineConfig } from 'astro/config';
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
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    plugins: [tailwindcss()]
  }
});