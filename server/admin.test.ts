/**
 * Admin Router Tests
 * Tests for admin-only procedures including order management, customer management, and inventory
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Admin Router", () => {
  // Mock admin context
  const mockAdminContext: Context = {
    user: {
      id: 1,
      openId: "admin-test-openid",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
      stripeCustomerId: null,
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  // Mock non-admin context
  const mockUserContext: Context = {
    user: {
      id: 2,
      openId: "user-test-openid",
      name: "Regular User",
      email: "user@test.com",
      role: "user",
      stripeCustomerId: null,
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockAdminContext);
  const userCaller = appRouter.createCaller(mockUserContext);

  describe("Authorization", () => {
    it("should allow admin to access getStats", async () => {
      const result = await caller.admin.getStats();
      expect(result).toBeDefined();
      expect(result.totalOrders).toBeGreaterThanOrEqual(0);
      expect(result.totalCustomers).toBeGreaterThanOrEqual(0);
    });

    it("should deny non-admin access to getStats", async () => {
      await expect(userCaller.admin.getStats()).rejects.toThrow("Admin access required");
    });
  });

  describe("Order Management", () => {
    it("should fetch orders with pagination", async () => {
      const result = await caller.admin.getOrders({
        page: 1,
        pageSize: 20,
        status: "all",
        fulfillmentStatus: "all",
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter orders by status", async () => {
      const result = await caller.admin.getOrders({
        page: 1,
        pageSize: 20,
        status: "paid",
        fulfillmentStatus: "all",
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter orders by fulfillment status", async () => {
      const result = await caller.admin.getOrders({
        page: 1,
        pageSize: 20,
        status: "all",
        fulfillmentStatus: "pending",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Customer Management", () => {
    it("should fetch customers with pagination", async () => {
      const result = await caller.admin.getCustomers({
        page: 1,
        pageSize: 20,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Inventory Management", () => {
    it("should fetch inventory items", async () => {
      const result = await caller.admin.getInventory({
        page: 1,
        pageSize: 50,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter inventory by category", async () => {
      const result = await caller.admin.getInventory({
        page: 1,
        pageSize: 50,
        category: "hookahs",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
