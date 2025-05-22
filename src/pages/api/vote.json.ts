import type { APIRoute } from 'astro';

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
