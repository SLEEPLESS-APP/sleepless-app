ALTER TABLE `events` MODIFY COLUMN `venueId` int;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `eventType` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `venue` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `address` text NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `city` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `province` varchar(100) NOT NULL;