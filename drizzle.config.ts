import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
  verbose: true
} satisfies Config;
