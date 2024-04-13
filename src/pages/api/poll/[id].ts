import { polls, users } from '@/models/schema';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, request }) => {
  const auth = request.headers.get('Authorization');
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }
  const id = params.id;
  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  return await db.transaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: eq(users.api_key, auth)
    });

    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, id),
      with: { options: true }
    });

    if (poll?.creatorId !== user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    return new Response(JSON.stringify(poll), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }); 
};
