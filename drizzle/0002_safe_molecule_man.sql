CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`adminName` varchar(255),
	`action` enum('approve','reject','edit','delete') NOT NULL,
	`targetType` varchar(50) NOT NULL,
	`targetId` int NOT NULL,
	`eventId` int,
	`reason` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
