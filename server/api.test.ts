import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `user${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Products API", () => {
  it("should list products", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const result = await caller.products.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a product for authenticated user", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      title: "Test Product",
      description: "Test Description",
      category: "Development",
      price: "99.99",
      licenseType: "perpetual",
    });

    expect(result).toBeDefined();
  });

  it("should get seller products", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getMySelling();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("License API", () => {
  it("should validate license key", async () => {
    const caller = appRouter.createCaller(createMockContext());

    const result = await caller.licenses.validateKey({
      key: "INVALID-KEY",
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe("License key not found");
  });

  it("should get user licenses", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.licenses.getMyLicenses();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Orders API", () => {
  it("should get user orders", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getMyOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Seller Profile API", () => {
  it("should get seller profile", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.seller.getMyProfile();
    // Result can be null if profile doesn't exist
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("should create seller profile", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.seller.createProfile({
      companyName: "Test Company",
      bio: "Test Bio",
    });

    expect(result).toBeDefined();
  });
});

describe("Auth API", () => {
  it("should get current user", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.id).toBe(1);
    expect(result?.openId).toBe("test-user-1");
  });

  it("should logout user", async () => {
    const ctx = createMockContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
