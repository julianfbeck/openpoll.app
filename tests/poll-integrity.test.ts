import { createClient, type Client } from '@libsql/client';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { pollOptions, polls, user } from '../src/models/schema';

const testDirectory = mkdtempSync(join(tmpdir(), 'openpoll-poll-integrity-'));
const databasePath = join(testDirectory, 'openpoll.db');
const databaseUrl = `file:${databasePath}`;

let migrationClient: Client;
let db: typeof import('../src/utils/db')['db'];
let createCaller: typeof import('../src/lib/trpc/routers/_app')['createCaller'];
let pollA: typeof polls.$inferSelect;
let pollB: typeof polls.$inferSelect;
let pollAOptions: Array<typeof pollOptions.$inferSelect>;
let pollBOptions: Array<typeof pollOptions.$inferSelect>;

const request = new Request('http://openpoll.test/api/trpc');

function caller(userId?: string) {
  return createCaller({
    req: request,
    resHeaders: new Headers(),
    user: userId ? { id: userId } : undefined
  });
}

async function loadPoll(shortId: string) {
  return db.query.polls.findFirst({
    where: eq(polls.shortId, shortId),
    with: { options: true }
  });
}

beforeAll(async () => {
  process.env.TURSO_URL = databaseUrl;
  process.env.TURSO_AUTH_TOKEN = '';

  migrationClient = createClient({ url: databaseUrl });
  const migration = readFileSync(
    resolve(process.cwd(), 'drizzle/0000_productive_swordsman.sql'),
    'utf8'
  ).replaceAll('--> statement-breakpoint', '');
  await migrationClient.executeMultiple(migration);

  ({ db } = await import('../src/utils/db'));
  ({ createCaller } = await import('../src/lib/trpc/routers/_app'));
});

beforeEach(async () => {
  await db.delete(pollOptions);
  await db.delete(polls);
  await db.delete(user);

  await db.insert(user).values([
    {
      id: 'owner-a',
      name: 'Owner A',
      email: 'owner-a@example.invalid',
      emailVerified: true
    },
    {
      id: 'owner-b',
      name: 'Owner B',
      email: 'owner-b@example.invalid',
      emailVerified: true
    }
  ]);

  [pollA] = await db
    .insert(polls)
    .values({
      event: 'Poll A',
      question: 'Question A',
      shortId: 'poll-a',
      creatorId: 'owner-a'
    })
    .returning();
  [pollB] = await db
    .insert(polls)
    .values({
      event: 'Poll B',
      question: 'Question B',
      shortId: 'poll-b',
      creatorId: 'owner-b'
    })
    .returning();

  pollAOptions = await db
    .insert(pollOptions)
    .values([
      { pollId: pollA.id, option: 'A1', votes: 0 },
      { pollId: pollA.id, option: 'A2', votes: 0 },
      { pollId: pollA.id, option: 'A3', votes: 0 }
    ])
    .returning();
  pollBOptions = await db
    .insert(pollOptions)
    .values([
      { pollId: pollB.id, option: 'B1', votes: 0 },
      { pollId: pollB.id, option: 'B2', votes: 0 }
    ])
    .returning();
});

afterAll(() => {
  migrationClient.close();
  rmSync(testDirectory, { force: true, recursive: true });
});

describe('poll vote integrity', () => {
  it('increments only the intended poll', async () => {
    await caller().poll.vote({
      shortId: pollA.shortId,
      optionIds: [pollAOptions[0].id]
    });

    expect((await loadPoll(pollA.shortId))?.votes).toBe(1);
    expect((await loadPoll(pollB.shortId))?.votes).toBe(0);
  });

  it('rejects an option belonging to another poll without changing votes', async () => {
    await expect(
      caller().poll.vote({
        shortId: pollA.shortId,
        optionIds: [pollBOptions[0].id]
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect((await loadPoll(pollA.shortId))?.votes).toBe(0);
    expect((await loadPoll(pollB.shortId))?.votes).toBe(0);
    expect((await loadPoll(pollB.shortId))?.options[0].votes).toBe(0);
  });

  it('counts duplicate option IDs only once', async () => {
    const optionId = pollAOptions[0].id;

    await caller().poll.vote({
      shortId: pollA.shortId,
      optionIds: [optionId, optionId, optionId]
    });

    const updated = await loadPoll(pollA.shortId);
    expect(updated?.votes).toBe(1);
    expect(updated?.options.find((option) => option.id === optionId)?.votes).toBe(1);
  });

  it('rejects votes for a locked poll without changing data', async () => {
    await db
      .update(polls)
      .set({ isLocked: true })
      .where(eq(polls.id, pollA.id));

    await expect(
      caller().poll.vote({
        shortId: pollA.shortId,
        optionIds: [pollAOptions[0].id]
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const updated = await loadPoll(pollA.shortId);
    expect(updated?.votes).toBe(0);
    expect(updated?.options.every((option) => option.votes === 0)).toBe(true);
  });

  it('rejects an empty option list without changing data', async () => {
    await expect(
      caller().poll.vote({ shortId: pollA.shortId, optionIds: [] })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    const updated = await loadPoll(pollA.shortId);
    expect(updated?.votes).toBe(0);
    expect(updated?.options.every((option) => option.votes === 0)).toBe(true);
  });

  it('increments every selected option but the poll total only once', async () => {
    const optionIds = pollAOptions.map((option) => option.id);

    await caller().poll.vote({ shortId: pollA.shortId, optionIds });

    const updated = await loadPoll(pollA.shortId);
    expect(updated?.votes).toBe(1);
    expect(updated?.options.map((option) => option.votes)).toEqual([1, 1, 1]);
  });
});

describe('moderator option integrity', () => {
  it('prevents an owner from selecting, editing, or deleting another poll option', async () => {
    const owner = caller('owner-a');
    const foreignOption = pollBOptions[0];

    await expect(
      owner.poll.selectCurrentPollOption({
        shortId: pollA.shortId,
        optionId: foreignOption.id
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    await expect(
      owner.poll.editPollOption({
        shortId: pollA.shortId,
        optionId: foreignOption.id,
        optionText: 'Manipulated'
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    await expect(
      owner.poll.deletePollOption({
        shortId: pollA.shortId,
        optionId: foreignOption.id
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect((await loadPoll(pollA.shortId))?.selectedPollOptionId).toBeNull();
    expect(
      (await loadPoll(pollB.shortId))?.options.find(
        (option) => option.id === foreignOption.id
      )?.option
    ).toBe('B1');
  });
});
