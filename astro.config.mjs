import { defineConfig, envField } from 'astro/config';
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
  env: {
    schema: {
      BETTER_AUTH_URL: envField.string({ context: "server", access: "secret" }),
      TURSO_URL: envField.string({ context: "server", access: "secret" }),
      TURSO_AUTH_TOKEN: envField.string({ context: "server", access: "secret" }), 
      GITHUB_CLIENT_ID: envField.string({ context: "server", access: "secret" }),
      GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret" }),
      PUBLIC_TRPC_URL: envField.string({ context: "server", access: "secret" }),
    }
  },
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