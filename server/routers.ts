import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  generateLicenseKey,
  getLicenseKeyByKey,
  getLicenseKeysByBuyerId,
  createOrder,
  getOrdersByBuyerId,
  getOrdersBySellerId,
  recordDownload,
  getSellerProfile,
  createSellerProfile,
} from "./db";
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
          return { valid: false, message: "License key not found" };
        }
        if (license.status !== "active") {
          return { valid: false, message: "License is " + license.status };
        }
        return {
          valid: true,
          message: "License is valid",
          license,
        };
      }),
  }),

  // Order endpoints
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().default(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        const totalPrice = (
          parseFloat(product.price) * input.quantity
        ).toString();

        const order = await createOrder({
          buyerId: ctx.user.id,
          sellerId: product.sellerId,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: product.price,
          totalPrice,
          currency: product.currency,
          status: "pending",
        });

        const key = `${product.id}-${nanoid(16)}`.toUpperCase();
        const orderId = (order as any).insertId || 1;
        await generateLicenseKey({
          productId: input.productId,
          buyerId: ctx.user.id,
          orderId: orderId as number,
          key,
        });

        return order;
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersByBuyerId(ctx.user.id);
    }),
    getSellingOrders: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersBySellerId(ctx.user.id);
    }),
  }),

  // Seller profile endpoints
  seller: router({
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
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
});

export type AppRouter = typeof appRouter;
