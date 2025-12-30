import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  generateLicenseKey,
  getLicenseKeyByKey,
  getLicenseKeysByBuyerId,
  createOrder,
  getOrdersByBuyerId,
  getOrdersBySellerId,
  recordDownload,
  getSellerProfile,
  createSellerProfile,
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReview,
  deleteReview,
  getAverageRating,
} from "./db";
import { getDb } from "./db";
import { products, licenseKeys, orders } from "../drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product endpoints
  products: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getProducts(input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),

    getMySelling: protectedProcedure.query(async ({ ctx }) => {
      return await getSellerProducts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          category: z.string().optional(),
          price: z.string(),
          licenseType: z.enum(["perpetual", "subscription", "trial"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createProduct({
          sellerId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
          licenseType: input.licenseType,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          price: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product || product.sellerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return await updateProduct(input.id, {
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
          active: input.active,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product || product.sellerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        return await db.delete(products).where(eq(products.id, input.id));
      }),
  }),

  // License endpoints
  licenses: router({
    getMyLicenses: protectedProcedure.query(async ({ ctx }) => {
      return await getLicenseKeysByBuyerId(ctx.user.id);
    }),

    validateKey: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const license = await getLicenseKeyByKey(input.key);
        if (!license) {
          return { valid: false, message: "Invalid license key" };
        }
        if (license.status !== "active") {
          return { valid: false, message: "License is not active" };
        }
        return { valid: true, message: "License is valid", license };
      }),

    generateForProduct: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          count: z.number().min(1).max(100),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.productId);
        if (!product || product.sellerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const keys = [];
        for (let i = 0; i < input.count; i++) {
          const key = await generateLicenseKey({
            productId: input.productId,
            key: `${input.productId}-${nanoid(20)}`,
            status: "inactive",
          });
          keys.push(key);
        }
        return keys;
      }),

    getSellerLicenses: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sellerProducts = await getSellerProducts(ctx.user.id);
      const productIds = sellerProducts.map((p: any) => p.id);

      if (productIds.length === 0) {
        return [];
      }

      return await db
        .select()
        .from(licenseKeys)
        .where(inArray(licenseKeys.productId, productIds))
        .orderBy(desc(licenseKeys.createdAt));
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          licenseId: z.number(),
          status: z.enum(["active", "inactive"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const license = await getDb().then((db) =>
          db
            ?.select()
            .from(licenseKeys)
            .where(eq(licenseKeys.id, input.licenseId))
            .limit(1)
        );

        if (!license || license.length === 0) {
          throw new Error("License not found");
        }

        const product = await getProductById(license[0].productId);
        if (!product || product.sellerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        return await db
          .update(licenseKeys)
          .set({ status: input.status })
          .where(eq(licenseKeys.id, input.licenseId));
      }),
  }),

  // Order endpoints
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          licenseKeyId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.productId);
        if (!product) throw new Error("Product not found");
        return await createOrder({
          productId: input.productId,
          sellerId: product.sellerId,
          buyerId: ctx.user.id,
          unitPrice: product.price,
          totalPrice: product.price,
          status: "completed",
        });
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersByBuyerId(ctx.user.id);
    }),

    getSellingOrders: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersBySellerId(ctx.user.id);
    }),
  }),

  // Seller profile endpoints
  sellerProfile: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getSellerProfile(ctx.user.id);
    }),

    createProfile: protectedProcedure
      .input(
        z.object({
          companyName: z.string().optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createSellerProfile({
          userId: ctx.user.id,
          companyName: input.companyName,
          bio: input.bio,
        });
      }),
  }),

  // Download tracking
  downloads: router({
    recordDownload: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          licenseKeyId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await recordDownload({
          userId: ctx.user.id,
          productId: input.productId,
          licenseKeyId: input.licenseKeyId,
        });
      }),
  }),

  // Review endpoints
  reviews: router({
    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          rating: z.number().min(1).max(5),
          title: z.string().min(1).max(255),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createReview({
          productId: input.productId,
          buyerId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          content: input.content,
          isVerifiedPurchase: true,
        });
      }),

    getByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await getReviewsByProductId(input.productId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getReviewById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          rating: z.number().min(1).max(5).optional(),
          title: z.string().min(1).max(255).optional(),
          content: z.string().min(1).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const review = await getReviewById(input.id);
        if (!review || review.buyerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return await updateReview(input.id, {
          rating: input.rating,
          title: input.title,
          content: input.content,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const review = await getReviewById(input.id);
        if (!review || review.buyerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return await deleteReview(input.id);
      }),

    getAverageRating: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await getAverageRating(input.productId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
