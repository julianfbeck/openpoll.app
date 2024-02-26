CREATE TABLE `pollOptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`pollId` integer NOT NULL,
	`option` text NOT NULL,
	`votes` integer NOT NULL,
	FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` integer PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`creatorId` text NOT NULL,
	FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
