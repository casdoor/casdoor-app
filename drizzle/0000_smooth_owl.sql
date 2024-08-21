CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_name` text NOT NULL,
	`old_account_name` text DEFAULT 'null',
	`secret` text NOT NULL,
	`issuer` text DEFAULT 'null',
	`token` text,
	`deleted_at` integer DEFAULT 'null',
	`changed_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`sync_at` integer DEFAULT 'null'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_account_name_issuer_unique` ON `accounts` (`account_name`,`issuer`);