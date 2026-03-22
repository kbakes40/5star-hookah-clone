/**
 * Checkout Router - Handles Stripe checkout session creation
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { createCheckoutSession } from "./stripe";

export const checkoutRouter = router({
  createSession: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            name: z.string(),
            priceInCents: z.number(),
            quantity: z.number(),
            image: z.string().optional(),
          })
        ),
        deliveryMethod: z.enum(["shipping", "pickup"]).default("shipping"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        console.log('[Checkout] Creating session with:', {
          origin,
          userId: ctx.user?.id || 0,
          userEmail: ctx.user?.email || "",
          userName: ctx.user?.name || "Guest",
          deliveryMethod: input.deliveryMethod,
          itemCount: input.items.length,
        });
        
        const session = await createCheckoutSession({
          userId: ctx.user?.id || 0,
          userEmail: ctx.user?.email || "",
          userName: ctx.user?.name || "Guest",
          items: input.items,
          deliveryMethod: input.deliveryMethod,
          successUrl: `${origin}/checkout/success`,
          cancelUrl: `${origin}/checkout/cancel`,
        });

        console.log('[Checkout] Session created successfully:', session.sessionId);
        return session;
      } catch (error: any) {
        console.error('[Checkout] Error creating session:', {
          message: error?.message,
          type: error?.type,
          code: error?.code,
          stack: error?.stack,
        });
        throw error;
      }
    }),

  // Create Zelle order (pending payment confirmation)
  createZelleOrder: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            name: z.string(),
            priceInCents: z.number(),
            quantity: z.number(),
            image: z.string().optional(),
          })
        ),
        deliveryMethod: z.enum(["shipping", "pickup"]).default("shipping"),
        customerName: z.string(),
        customerPhone: z.string(),
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const { orders } = await import("../drizzle/schema");
      const { TRPCError } = await import("@trpc/server");

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        console.log('[Zelle Checkout] Creating order with:', {
          userId: ctx.user?.id || 0,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryMethod: input.deliveryMethod,
          totalAmount: input.totalAmount,
          itemCount: input.items.length,
        });

        // Create order with pending status
        const [order] = await db.insert(orders).values({
          userId: ctx.user?.id || 0,
          stripePaymentIntentId: `zelle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID for Zelle orders
          stripeCheckoutSessionId: null,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryMethod: input.deliveryMethod,
          paymentMethod: "zelle",
          status: "pending",
          fulfillmentStatus: "pending",
          totalAmount: input.totalAmount,
          currency: "usd",
          items: JSON.stringify(input.items),
          shippingAddress: null,
        }).$returningId();

        console.log('[Zelle Checkout] Order created successfully:', order.id);

        return {
          orderId: order.id,
          success: true,
        };
      } catch (error: any) {
        console.error('[Zelle Checkout] Error creating order:', {
          message: error?.message,
          stack: error?.stack,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Zelle order",
        });
      }
    }),
});
