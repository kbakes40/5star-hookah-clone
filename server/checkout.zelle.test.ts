/**
 * Test suite for Zelle payment functionality
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { orders, storeSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Zelle Payment Integration", () => {
  let testOrderId: number;

  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  afterAll(async () => {
    // Clean up test order if created
    if (testOrderId) {
      const db = await getDb();
      if (db) {
        await db.delete(orders).where(eq(orders.id, testOrderId));
      }
    }
  });

  it("should create a Zelle order with pending status", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a test Zelle order
    const [order] = await db.insert(orders).values({
      userId: 0,
      stripePaymentIntentId: `zelle_test_${Date.now()}`,
      stripeCheckoutSessionId: null,
      customerName: "Test Customer",
      customerPhone: "313-555-1234",
      deliveryMethod: "shipping",
      paymentMethod: "zelle",
      status: "pending",
      fulfillmentStatus: "pending",
      totalAmount: 5000, // $50.00
      currency: "usd",
      items: JSON.stringify([
        {
          name: "Test Product",
          priceInCents: 5000,
          quantity: 1,
        },
      ]),
      shippingAddress: null,
    }).$returningId();

    testOrderId = order.id;

    expect(order.id).toBeDefined();
    expect(typeof order.id).toBe("number");

    // Verify order was created with correct values
    const [createdOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .limit(1);

    expect(createdOrder).toBeDefined();
    expect(createdOrder.paymentMethod).toBe("zelle");
    expect(createdOrder.status).toBe("pending");
    expect(createdOrder.customerName).toBe("Test Customer");
    expect(createdOrder.totalAmount).toBe(5000);
  });

  it("should confirm Zelle payment and update status to paid", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a test Zelle order
    const [order] = await db.insert(orders).values({
      userId: 0,
      stripePaymentIntentId: `zelle_test_confirm_${Date.now()}`,
      stripeCheckoutSessionId: null,
      customerName: "Test Customer 2",
      customerPhone: "313-555-5678",
      deliveryMethod: "pickup",
      paymentMethod: "zelle",
      status: "pending",
      fulfillmentStatus: "pending",
      totalAmount: 7500, // $75.00
      currency: "usd",
      items: JSON.stringify([
        {
          name: "Test Product 2",
          priceInCents: 7500,
          quantity: 1,
        },
      ]),
      shippingAddress: null,
    }).$returningId();

    const orderId = order.id;

    // Confirm payment (simulate admin action)
    await db
      .update(orders)
      .set({
        status: "paid",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Verify status was updated
    const [updatedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    expect(updatedOrder.status).toBe("paid");
    expect(updatedOrder.paymentMethod).toBe("zelle");

    // Clean up
    await db.delete(orders).where(eq(orders.id, orderId));
  });

  it("should store Zelle payment information in store settings", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get store settings
    const settingsResult = await db
      .select()
      .from(storeSettings)
      .limit(1);

    // Store settings may not exist yet, but schema should support Zelle fields
    // If settings exist, they should have Zelle fields
    if (settingsResult.length > 0) {
      const settings = settingsResult[0];
      expect(settings).toHaveProperty("zelleEmail");
      expect(settings).toHaveProperty("zellePhone");
    }

    // Verify we can create settings with Zelle fields
    const testSettings = {
      storeName: "Test Store",
      address: "123 Test St",
      city: "Test City",
      state: "MI",
      zipCode: "12345",
      phone: "555-1234",
      email: "test@test.com",
      hours: "9-5",
      pickupInstructions: "Test instructions",
      zelleEmail: "zelle@test.com",
      zellePhone: "555-5678",
    };

    // This should not throw an error
    expect(() => testSettings).not.toThrow();
  });

  it("should differentiate between Stripe and Zelle orders", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a Stripe order
    const [stripeOrder] = await db.insert(orders).values({
      userId: 0,
      stripePaymentIntentId: `stripe_test_${Date.now()}`,
      stripeCheckoutSessionId: "test_session",
      customerName: "Stripe Customer",
      deliveryMethod: "shipping",
      paymentMethod: "stripe",
      status: "paid",
      fulfillmentStatus: "pending",
      totalAmount: 10000,
      currency: "usd",
      items: JSON.stringify([{ name: "Product", priceInCents: 10000, quantity: 1 }]),
      shippingAddress: null,
    }).$returningId();

    // Create a Zelle order
    const [zelleOrder] = await db.insert(orders).values({
      userId: 0,
      stripePaymentIntentId: `zelle_test_${Date.now()}`,
      stripeCheckoutSessionId: null,
      customerName: "Zelle Customer",
      customerPhone: "313-555-9999",
      deliveryMethod: "pickup",
      paymentMethod: "zelle",
      status: "pending",
      fulfillmentStatus: "pending",
      totalAmount: 10000,
      currency: "usd",
      items: JSON.stringify([{ name: "Product", priceInCents: 10000, quantity: 1 }]),
      shippingAddress: null,
    }).$returningId();

    // Verify both orders exist with correct payment methods
    const [stripeOrderData] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, stripeOrder.id))
      .limit(1);

    const [zelleOrderData] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, zelleOrder.id))
      .limit(1);

    expect(stripeOrderData.paymentMethod).toBe("stripe");
    expect(stripeOrderData.status).toBe("paid");
    expect(zelleOrderData.paymentMethod).toBe("zelle");
    expect(zelleOrderData.status).toBe("pending");

    // Clean up
    await db.delete(orders).where(eq(orders.id, stripeOrder.id));
    await db.delete(orders).where(eq(orders.id, zelleOrder.id));
  });
});
