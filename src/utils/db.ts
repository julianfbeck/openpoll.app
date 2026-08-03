import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../models/schema.ts';


export const db = drizzle({
  schema: schema,
  connection: {
    url: import.meta.env.TURSO_URL || 'file:/data/openpoll.db',
    authToken: import.meta.env.TURSO_AUTH_TOKEN || undefined,
  },
});

export * from '../models/schema.ts';
