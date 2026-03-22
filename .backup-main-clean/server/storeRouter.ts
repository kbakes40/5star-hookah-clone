/**
 * Store Router - Public endpoints for store information
 */

import { router, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { storeSettings, orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const storeRouter = router({
  // Get store settings (public endpoint for checkout success page)
  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const settings = await db.select().from(storeSettings).limit(1);
    
    if (!settings || settings.length === 0) {
      // Return default settings if none exist
      return {
        id: 0,
        storeName: "The Boss Hookah Wholesale",
        address: "6520 Greenfield Rd",
        city: "Dearborn",
        state: "MI",
        zipCode: "48126",
        phone: "(313) 406-6589",
        email: "info@bosshookah.com",
        hours: "Open Daily\nCloses 1:00 AM",
        pickupInstructions: "Please bring your order confirmation and a valid ID when picking up your order. Call us at (313) 406-6589 if you have any questions.",
        zelleEmail: null,
        zellePhone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return settings[0];
  }),

  // Get order by Stripe session ID (public endpoint for checkout success page)
  getOrderBySessionId: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [order] = await db
        .select({
          id: orders.id,
          stripeCheckoutSessionId: orders.stripeCheckoutSessionId,
          totalAmount: orders.totalAmount,
          deliveryMethod: orders.deliveryMethod,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.stripeCheckoutSessionId, input.sessionId))
        .limit(1);

      if (!order) {
        return null;
      }

      return order;
    }),
});
