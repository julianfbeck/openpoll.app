import {
  accounts,
  comments,
  pollOptions,
  polls,
  sessions,
  users,
  verificationTokens,
  votingTraffic
} from './schema.ts';

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type Account = InferSelectModel<typeof accounts>;

export type Comment = InferSelectModel<typeof comments>;

export type Session = InferSelectModel<typeof sessions>;

export type User = InferSelectModel<typeof users>;

export type Poll = InferSelectModel<typeof polls> & {
  options: PollOption[];
};

export type PollOption = InferSelectModel<typeof pollOptions>;

export type VerificationToken = InferSelectModel<typeof verificationTokens>;

export type PollCreate = InferInsertModel<typeof polls>;

export type PollOptionCreate = InferInsertModel<typeof pollOptions>;

export type VotingTraffic = InferInsertModel<typeof votingTraffic>;
