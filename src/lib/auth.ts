import { account, session, user, verification } from '@/models/schema';
import { db } from '@/utils/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import 'dotenv/config';

export const auth = betterAuth({
  baseURL: 'http://localhost:4321',
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user,
      session,
      account,
      verification
    }
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }
  },
  plugins: [],
});