import { account, session, user, verification } from '@/models/schema';
import { db } from '@/utils/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  baseURL: import.meta.env.BETTER_AUTH_URL!,
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
      clientId: import.meta.env.GITHUB_CLIENT_ID!,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET!
    }
  },
  plugins: [],
});