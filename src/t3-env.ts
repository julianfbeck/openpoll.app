import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// in case if the script was imported from node like in case of migrations
const runtimeEnv =
  process.env.NODE_ENV === 'production' ? process.env : import.meta.env;

export const env = createEnv({
  server: {
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    TURSO_URL: z.string(),
    TURSO_AUTH_TOKEN: z.string()
  },
  client: {
    PUBLIC_TRPC_URL: z.string()
  },
  // Astro bundles all environment variables so
  // we don't need to manually destructure them
  runtimeEnv,
  // process is not available in Astro, so we must set this explicitly
  skipValidation: import.meta.env.SKIP_ENV_VALIDATION === 'development',
  clientPrefix: 'PUBLIC_'
});
