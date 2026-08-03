import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';


// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), mdx()],
  adapter: node({
    mode: 'standalone'
  }),
  env: {
    schema: {
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:4321' }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret' }),
      ALLOW_SIGNUP: envField.boolean({ context: 'server', access: 'secret', default: false }),
      TURSO_URL: envField.string({ context: 'server', access: 'secret', default: 'file:/data/openpoll.db' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
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
