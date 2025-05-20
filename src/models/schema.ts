import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { relations, sql } from 'drizzle-orm';

export const user = sqliteTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  api_key: text('api_key').$defaultFn(() => `op_${nanoid(15)}`)
});

export const session = sqliteTable("session", {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date())
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
      .references(() => user.id, { onDelete: 'cascade' }),
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