CREATE TABLE `generic_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installationKey` varchar(64) NOT NULL,
	`reducedMotion` boolean NOT NULL DEFAULT false,
	`privacyLock` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generic_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `generic_preferences_installationKey_unique` UNIQUE(`installationKey`)
);
--> statement-breakpoint
CREATE TABLE `generic_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installationKey` varchar(64) NOT NULL,
	`templateKey` varchar(48) NOT NULL,
	`status` enum('todo','done') NOT NULL DEFAULT 'todo',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generic_tasks_id` PRIMARY KEY(`id`)
);
