CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`quantity` int NOT NULL,
	`totalAmount` int NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`transactionId` varchar(255) NOT NULL,
	`qrCode` text NOT NULL,
	`status` enum('pending','confirmed','cancelled','refunded') NOT NULL DEFAULT 'confirmed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`venueId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`posterUrl` varchar(500) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`eventTime` varchar(10) NOT NULL,
	`eventType` enum('Club','Festival','Concert','Pool Party','Rooftop') NOT NULL,
	`price` int NOT NULL,
	`ticketsAvailable` int NOT NULL,
	`ticketsSold` int NOT NULL DEFAULT 0,
	`status` enum('draft','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20),
	`website` varchar(500),
	`bio` text,
	`verified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`province` varchar(100) NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`capacity` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `venues_id` PRIMARY KEY(`id`)
);
