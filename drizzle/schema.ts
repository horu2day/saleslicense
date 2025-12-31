import {
  serial,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// Enum definitions for PostgreSQL
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const licenseTypeEnum = pgEnum("license_type", ["perpetual", "subscription", "trial"]);
export const licenseStatusEnum = pgEnum("license_status", ["active", "inactive", "revoked", "expired"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed", "failed", "refunded"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Software products table
 * Stores all software products available for sale
 */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("sellerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    version: varchar("version", { length: 50 }),
    downloadUrl: text("downloadUrl"),
    licenseType: licenseTypeEnum("licenseType").default("perpetual").notNull(),
    maxDownloads: integer("maxDownloads"),
    expiryDays: integer("expiryDays"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    sellerIdx: index("products_seller_idx").on(table.sellerId),
    categoryIdx: index("products_category_idx").on(table.category),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * License keys table
 * Stores generated license keys for products
 */
export const licenseKeys = pgTable(
  "license_keys",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    buyerId: integer("buyerId"),
    orderId: integer("orderId"),
    status: licenseStatusEnum("status").default("active").notNull(),
    activatedAt: timestamp("activatedAt"),
    expiresAt: timestamp("expiresAt"),
    activationCount: integer("activationCount").default(0).notNull(),
    maxActivations: integer("maxActivations").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("license_keys_product_idx").on(table.productId),
    buyerIdx: index("license_keys_buyer_idx").on(table.buyerId),
    keyIdx: index("license_keys_key_idx").on(table.key),
  })
);

export type LicenseKey = typeof licenseKeys.$inferSelect;
export type InsertLicenseKey = typeof licenseKeys.$inferInsert;

/**
 * Orders table
 * Stores purchase orders and transactions
 */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    buyerId: integer("buyerId").notNull(),
    sellerId: integer("sellerId").notNull(),
    productId: integer("productId").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric("totalPrice", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: orderStatusEnum("status").default("pending").notNull(),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    transactionId: varchar("transactionId", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    buyerIdx: index("orders_buyer_idx").on(table.buyerId),
    sellerIdx: index("orders_seller_idx").on(table.sellerId),
    productIdx: index("orders_product_idx").on(table.productId),
    statusIdx: index("orders_status_idx").on(table.status),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Reviews table
 * Stores customer reviews and ratings for products
 */
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    buyerId: integer("buyerId").notNull(),
    rating: integer("rating").notNull(), // 1-5 stars
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    helpful: integer("helpful").default(0).notNull(), // Number of helpful votes
    isVerifiedPurchase: boolean("isVerifiedPurchase").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("reviews_product_idx").on(table.productId),
    buyerIdx: index("reviews_buyer_idx").on(table.buyerId),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Downloads table
 * Tracks product downloads by users
 */
export const downloads = pgTable(
  "downloads",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    productId: integer("productId").notNull(),
    licenseKeyId: integer("licenseKeyId"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("downloads_user_idx").on(table.userId),
    productIdx: index("downloads_product_idx").on(table.productId),
    licenseKeyIdx: index("downloads_license_key_idx").on(table.licenseKeyId),
  })
);

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

/**
 * Seller profiles table
 * Additional information for sellers
 */
export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 255 }),
  totalEarnings: numeric("totalEarnings", { precision: 15, scale: 2 })
    .default("0")
    .notNull(),
  totalSales: integer("totalSales").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = typeof sellerProfiles.$inferInsert;
