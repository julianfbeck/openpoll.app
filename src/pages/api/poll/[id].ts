import { polls, user } from '@/models/schema';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, request }) => {
  const authHeader = request.headers.get('Authorization');
  const auth =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;
  const id = params.id;
  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  return await db.transaction(async (tx) => {
    const u = await tx.query.user.findFirst({
      where: eq(user.api_key, auth)
    });

    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, id),
      with: { options: true }
    });

    if (poll?.creatorId !== u?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    return new Response(JSON.stringify(poll), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });
};
