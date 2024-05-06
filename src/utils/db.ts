// when using better-sqlite3
//import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../models/schema.ts';
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// when using sqlite3
const sqlite = new Database(
  process.env.NODE_ENV === 'production' ? '/data/db.sqlite3' : './db.sqlite3'
);

// when using turso
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { env } from '@/t3-env.ts';

const client = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(client, { schema });

migrate(db, { migrationsFolder: './drizzle' });
