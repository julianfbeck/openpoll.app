import { createAuthClient } from 'better-auth/react';

// see https://www.better-auth.com/docs/concepts/client
export const authClient = createAuthClient({
	baseURL: 'http://localhost:4321'
});
