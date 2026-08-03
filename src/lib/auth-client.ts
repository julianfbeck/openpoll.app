import { createAuthClient } from 'better-auth/react';
// see https://www.better-auth.com/docs/concepts/client
// Without an explicit base URL, Better Auth uses the browser's current origin.
export const authClient = createAuthClient();
