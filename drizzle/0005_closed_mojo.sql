ALTER TABLE `organizers` MODIFY COLUMN `contactEmail` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `organizers` MODIFY COLUMN `contactPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `organizers` MODIFY COLUMN `website` varchar(255);--> statement-breakpoint
ALTER TABLE `organizers` ADD `verificationDocs` text;--> statement-breakpoint
ALTER TABLE `organizers` ADD `socialLinks` text;--> statement-breakpoint
ALTER TABLE `organizers` ADD CONSTRAINT `organizers_contactEmail_unique` UNIQUE(`contactEmail`);--> statement-breakpoint
ALTER TABLE `organizers` DROP COLUMN `updatedAt`;