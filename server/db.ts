import { eq, and, desc, asc, like, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  licenseKeys,
  orders,
  downloads,
  sellerProfiles,
  reviews,
  InsertProduct,
  InsertLicenseKey,
  InsertOrder,
  InsertDownload,
  InsertSellerProfile,
  InsertReview,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getProducts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getProductsByCategory(category: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, category),
        eq(products.active, true)
      )
    )
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getSellerProducts(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt));
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(
  productId: number,
  updates: Partial<InsertProduct>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(products)
    .set(updates)
    .where(eq(products.id, productId));
}

// License key queries
export async function generateLicenseKey(licenseKey: InsertLicenseKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(licenseKeys).values(licenseKey);
}

export async function getLicenseKeyByKey(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.key, key))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getLicenseKeysByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.productId, productId));
}

export async function getLicenseKeysByBuyerId(buyerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.buyerId, buyerId));
}

// Order queries
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(orders).values(order);
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getOrdersByBuyerId(buyerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.buyerId, buyerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "completed" | "failed" | "refunded"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, orderId));
}

// Download queries
export async function recordDownload(download: InsertDownload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(downloads).values(download);
}

export async function getDownloadsByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(downloads)
    .where(eq(downloads.productId, productId));
}

// Seller profile queries
export async function getSellerProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createSellerProfile(profile: InsertSellerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(sellerProfiles).values(profile);
}

export async function updateSellerProfile(
  userId: number,
  updates: Partial<InsertSellerProfile>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(sellerProfiles)
    .set(updates)
    .where(eq(sellerProfiles.userId, userId));
}

// Review functions
export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(review);
  return result;
}

export async function getReviewsByProductId(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewById(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateReview(
  reviewId: number,
  updates: Partial<InsertReview>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(reviews)
    .set(updates)
    .where(eq(reviews.id, reviewId));
}

export async function deleteReview(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(reviews).where(eq(reviews.id, reviewId));
}

export async function getAverageRating(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      avgRating: sql`AVG(${reviews.rating})`,
      count: sql`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  return result[0];
}
