import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';
import type { AdapterAccount } from '@auth/core/adapters';
import { nanoid } from 'nanoid';
import { relations, sql } from 'drizzle-orm';

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
);

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey(),
  author: text('author').notNull(),
  content: text('content').notNull()
});

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
});

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  api_key: text('api_key').$defaultFn(() => `op_${nanoid(15)}`)
});

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
);

export const polls = sqliteTable(
  'polls',
  {
    id: integer('id').primaryKey(),
    event: text('event').notNull(),
    question: text('question').notNull(),
    timestamp: text('timestamp')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    views: integer('views').notNull().default(0),
    votes: integer('votes').notNull().default(0),
    shortId: text('shortId')
      .notNull()
      .notNull()
      .$defaultFn(() => nanoid(10)),
    creatorId: text('creatorId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isLocked: integer('isLocked', { mode: 'boolean' }).notNull().default(false),
    selectedPollOptionId: integer('selectedPollOptionId')
  },
  (table) => {
    return {
      shortIdx: index('shortid_idx').on(table.shortId)
    };
  }
);

export const pollOptions = sqliteTable(
  'pollOptions',
  {
    id: integer('id').primaryKey(),
    pollId: integer('pollId')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    option: text('option').notNull(),
    votes: integer('votes').notNull()
  },
  (table) => ({
    pollIdIdx: index('idx_pollid_on_polloptions').on(table.pollId)
  })
);

export const pollsRelations = relations(polls, ({ many }) => ({
  options: many(pollOptions)
}));

export const pollOptionsRelations = relations(pollOptions, ({ one }) => ({
  creator: one(polls, { fields: [pollOptions.pollId], references: [polls.id] })
}));