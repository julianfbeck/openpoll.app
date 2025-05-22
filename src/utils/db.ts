import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../models/schema.ts';


export const db = drizzle({
  schema: schema,
  connection: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

export * from '../models/schema.ts';