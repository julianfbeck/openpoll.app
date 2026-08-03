import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../models/schema.ts';


export const db = drizzle({
  schema: schema,
  connection: {
    url: process.env.TURSO_URL || import.meta.env.TURSO_URL || 'file:/data/openpoll.db',
    authToken:
      process.env.TURSO_AUTH_TOKEN ||
      import.meta.env.TURSO_AUTH_TOKEN ||
      undefined,
  },
});

export * from '../models/schema.ts';
