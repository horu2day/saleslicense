CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`licenseKeyId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`buyerId` int,
	`orderId` int,
	`status` enum('active','inactive','revoked','expired') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp,
	`expiresAt` timestamp,
	`activationCount` int NOT NULL DEFAULT 0,
	`maxActivations` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`version` varchar(50),
	`downloadUrl` text,
	`licenseType` enum('perpetual','subscription','trial') NOT NULL DEFAULT 'perpetual',
	`maxDownloads` int,
	`expiryDays` int,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`bio` text,
	`website` varchar(255),
	`bankAccount` varchar(255),
	`totalEarnings` decimal(15,2) NOT NULL DEFAULT '0',
	`totalSales` int NOT NULL DEFAULT 0,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `downloads` (`userId`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `downloads` (`productId`);--> statement-breakpoint
CREATE INDEX `license_key_idx` ON `downloads` (`licenseKeyId`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `license_keys` (`productId`);--> statement-breakpoint
CREATE INDEX `buyer_idx` ON `license_keys` (`buyerId`);--> statement-breakpoint
CREATE INDEX `key_idx` ON `license_keys` (`key`);--> statement-breakpoint
CREATE INDEX `buyer_idx` ON `orders` (`buyerId`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `orders` (`sellerId`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `orders` (`productId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `products` (`sellerId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category`);