CREATE TABLE `access_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`interest` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `access_requests_user_created` ON `access_requests` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`mark_type` text NOT NULL,
	`category` text NOT NULL,
	`market` text NOT NULL,
	`owner` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `brands_user_created` ON `brands` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `review_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`brand_id` text,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`channel` text NOT NULL,
	`note` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `review_links_user_brand` ON `review_links` (`user_id`,`brand_id`);