CREATE TABLE `votingTraffic` (
	`id` integer PRIMARY KEY NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`pollId` integer NOT NULL,
	FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade
);
