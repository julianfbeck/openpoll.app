import {
  account,
  pollOptions,
  polls,
  session,
  user,
  verificationTokens
} from './schema.ts';


import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type Account = InferSelectModel<typeof account>;

export type Session = InferSelectModel<typeof session>;

export type User = InferSelectModel<typeof user>;

export type Poll = InferSelectModel<typeof polls> & {
  options: PollOption[];
};

export type PollOption = InferSelectModel<typeof pollOptions>;

export type VerificationToken = InferSelectModel<typeof verificationTokens>;

export type PollCreate = InferInsertModel<typeof polls>;

export type PollOptionCreate = InferInsertModel<typeof pollOptions>;
