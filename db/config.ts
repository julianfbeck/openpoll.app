import { defineDb, defineTable, column } from 'astro:db';
export default defineDb({
  tables: {}
});

export const accounts = defineTable(
  {
    columns: {
      userId: column.text('userId')
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
    }
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
);
