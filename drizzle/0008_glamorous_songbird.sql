ALTER TABLE polls ADD `isLocked` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE polls ADD `selectedPollOptionId` integer;