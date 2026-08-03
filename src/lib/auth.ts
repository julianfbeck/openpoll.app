import { account, session, user, verification } from '@/models/schema';
import { db } from '@/utils/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:4321';
const baseOrigin = new URL(baseURL).origin;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL: baseOrigin,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseOrigin],
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.ALLOW_SIGNUP !== 'true'
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user,
      session,
      account,
      verification
    }
  }),
  socialProviders: githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret
        }
      }
    : {},
  advanced: {
    useSecureCookies: new URL(baseOrigin).protocol === 'https:'
  },
  plugins: [],
});
