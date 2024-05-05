import { generateOgImageForSite } from '@/components/generateOgImage';
import { polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  const poll = await db.query.polls.findFirst({
    where: eq(polls.shortId, id),
    with: { options: true }
  });

  if (!poll) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(await generateOgImageForSite(poll), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
};
