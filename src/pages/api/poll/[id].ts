import { polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.id ?? ''; //shortId

  const session = await getSession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const poll = await db.query.polls.findFirst({
    where: eq(polls.shortId, id),
    with: { options: true }
  });

  if (poll == undefined) return new Response('Not found', { status: 404 });

  return new Response(JSON.stringify(poll));
};
