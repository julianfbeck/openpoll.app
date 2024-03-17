import GitHub from '@auth/core/providers/github';
import Discord from '@auth/core/providers/discord';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './src/utils/db';
import type { AuthConfig } from '@auth/core';
import { env } from '@/t3-env';

export default {
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }),
    Discord({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    })
  ],
  trustHost: true,
  secret: env.AUTH_SECRET,

  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
} satisfies AuthConfig;
