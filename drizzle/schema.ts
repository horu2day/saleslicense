import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  unique,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Software products table
 * Stores all software products available for sale
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: int("sellerId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    version: varchar("version", { length: 50 }),
    downloadUrl: text("downloadUrl"),
    licenseType: mysqlEnum("licenseType", [
      "perpetual",
      "subscription",
      "trial",
    ])
      .default("perpetual")
      .notNull(),
    maxDownloads: int("maxDownloads"),
    expiryDays: int("expiryDays"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sellerIdx: index("seller_idx").on(table.sellerId),
    categoryIdx: index("category_idx").on(table.category),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * License keys table
 * Stores generated license keys for products
 */
export const licenseKeys = mysqlTable(
  "license_keys",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    buyerId: int("buyerId"),
    orderId: int("orderId"),
    status: mysqlEnum("status", ["active", "inactive", "revoked", "expired"])
      .default("active")
      .notNull(),
    activatedAt: timestamp("activatedAt"),
    expiresAt: timestamp("expiresAt"),
    activationCount: int("activationCount").default(0).notNull(),
    maxActivations: int("maxActivations").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_idx").on(table.productId),
    buyerIdx: index("buyer_idx").on(table.buyerId),
    keyIdx: index("key_idx").on(table.key),
  })
);

export type LicenseKey = typeof licenseKeys.$inferSelect;
export type InsertLicenseKey = typeof licenseKeys.$inferInsert;

/**
 * Orders table
 * Stores purchase orders and transactions
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerId: int("buyerId").notNull(),
    sellerId: int("sellerId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").default(1).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: mysqlEnum("status", [
      "pending",
      "completed",
      "failed",
      "refunded",
    ])
      .default("pending")
      .notNull(),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    transactionId: varchar("transactionId", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    buyerIdx: index("buyer_idx").on(table.buyerId),
    sellerIdx: index("seller_idx").on(table.sellerId),
    productIdx: index("product_idx").on(table.productId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Reviews table
 * Stores customer reviews and ratings for products
 */
export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    buyerId: int("buyerId").notNull(),
    rating: int("rating").notNull(), // 1-5 stars
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    helpful: int("helpful").default(0).notNull(), // Number of helpful votes
    isVerifiedPurchase: boolean("isVerifiedPurchase").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_idx").on(table.productId),
    buyerIdx: index("buyer_idx").on(table.buyerId),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Downloads table
 * Tracks product downloads by users
 */
export const downloads = mysqlTable(
  "downloads",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    licenseKeyId: int("licenseKeyId"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    productIdx: index("product_idx").on(table.productId),
    licenseKeyIdx: index("license_key_idx").on(table.licenseKeyId),
  })
);

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

/**
 * Seller profiles table
 * Additional information for sellers
 */
export const sellerProfiles = mysqlTable("seller_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 255 }),
  totalEarnings: decimal("totalEarnings", { precision: 15, scale: 2 })
    .default("0")
    .notNull(),
  totalSales: int("totalSales").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = typeof sellerProfiles.$inferInsert;