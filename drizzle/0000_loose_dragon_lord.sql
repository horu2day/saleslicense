CREATE TYPE "public"."license_status" AS ENUM('active', 'inactive', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('perpetual', 'subscription', 'trial');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"licenseKeyId" integer,
	"ipAddress" varchar(45),
	"userAgent" text,
	"downloadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"key" varchar(255) NOT NULL,
	"buyerId" integer,
	"orderId" integer,
	"status" "license_status" DEFAULT 'active' NOT NULL,
	"activatedAt" timestamp,
	"expiresAt" timestamp,
	"activationCount" integer DEFAULT 0 NOT NULL,
	"maxActivations" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "license_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyerId" integer NOT NULL,
	"sellerId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"paymentMethod" varchar(50),
	"transactionId" varchar(255),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sellerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"version" varchar(50),
	"downloadUrl" text,
	"licenseType" "license_type" DEFAULT 'perpetual' NOT NULL,
	"maxDownloads" integer,
	"expiryDays" integer,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"buyerId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"helpful" integer DEFAULT 0 NOT NULL,
	"isVerifiedPurchase" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"companyName" varchar(255),
	"bio" text,
	"website" varchar(255),
	"bankAccount" varchar(255),
	"totalEarnings" numeric(15, 2) DEFAULT '0' NOT NULL,
	"totalSales" integer DEFAULT 0 NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "downloads_user_idx" ON "downloads" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "downloads_product_idx" ON "downloads" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "downloads_license_key_idx" ON "downloads" USING btree ("licenseKeyId");--> statement-breakpoint
CREATE INDEX "license_keys_product_idx" ON "license_keys" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "license_keys_buyer_idx" ON "license_keys" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "license_keys_key_idx" ON "license_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "orders_buyer_idx" ON "orders" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "orders_seller_idx" ON "orders" USING btree ("sellerId");--> statement-breakpoint
CREATE INDEX "orders_product_idx" ON "orders" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_seller_idx" ON "products" USING btree ("sellerId");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "reviews_buyer_idx" ON "reviews" USING btree ("buyerId");