import { redisClient } from '@/lib/redis';
import { pollOptions, polls, users } from '@/models/schema';
import type { PollOptionCreate } from '@/models/types';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// create zod object for input

const createInput = z.object({
  name: z.string().min(1).max(200),
  question: z.string().min(1).max(200),
  options: z.array(z.string().min(1).max(200)).min(2).max(10)
});

export type CreateInput = z.infer<typeof createInput>;

export const POST: APIRoute = async ({ request }) => {
  //get auth header from request
  // get auutorisation bearer header

  const authHeader = request.headers.get('Authorization');
  const auth =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  //rate limit using redis
  const limit = 10;
  const key = `rate-limit-api:${auth}`;
  const current = await redisClient.incr(key);

  if (current > limit) {
    await redisClient.expire(key, 3600);
    return new Response('Too many requests', { status: 429 });
  }
  if (current === 1) {
    await redisClient.expire(key, 3600);
  }

  const body = await request.json();
  const input = createInput.parse(body);

  return await db.transaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: eq(users.api_key, auth)
    });
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    const poll = await tx.insert(polls).values({
      event: input.name,
      question: input.question,
      creatorId: user.id
    });

    const options = input.options.map((option) => ({
      pollId: poll.lastInsertRowid,
      option,
      votes: 0
    })) as PollOptionCreate[];

    await tx.insert(pollOptions).values(options);
    const fullPoll = await db.query.polls.findFirst({
      where: eq(polls.id, Number(poll.lastInsertRowid)),
      with: { options: true }
    });

    //add url to poll to be fullObject
    const fullPollWithUrl = {
      ...fullPoll,
      url: `https:///openpoll.app/${fullPoll?.shortId}`,
      api_url: `http://openpoll.app/api/poll/${fullPoll?.shortId}`
    };

    return new Response(JSON.stringify(fullPollWithUrl), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  });
};

//curl -X POST -H "Authorization : 123" -H "Content-Type: application/json" -d '{"question":"What is your favorite color?","options":["Red","Blue","Green"]}' http://localhost:3000/api/poll/create
