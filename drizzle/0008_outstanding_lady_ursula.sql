CREATE TABLE `ticketTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`sold` int NOT NULL DEFAULT 0,
	`maxPerOrder` int NOT NULL DEFAULT 10,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticketTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `ticketTypeId` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `ticketTypeName` varchar(100);