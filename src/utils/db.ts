import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../models/schema.ts';

// when using turso
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { env } from '@/t3-env.ts';


export const db = drizzle({
  schema: schema,
  connection: {
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
});

export * from '../models/schema.ts';