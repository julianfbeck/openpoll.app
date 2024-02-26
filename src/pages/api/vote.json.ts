import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';

const usernames = ['Sarah', 'Chris', 'Yan', 'Elian'];

export const GET: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });
  return new Response(
    JSON.stringify({
      name: usernames
    })
  );
};
