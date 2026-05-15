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

  /**
   * Authorize.Net Accept.js auth+capture. Client tokenizes the card with Accept.js and
   * POSTs the opaque nonce here; the server recomputes the total from line items (the
   * client-sent amount is never trusted) and persists to the Drizzle `orders` table the
   * same way `createZelleOrder` does (paymentMethod 'authnet', txId in
   * stripePaymentIntentId, invoice in stripeCheckoutSessionId — Phase B renames these
   * columns uniformly across processors).
   */
  chargeAuthNet: publicProcedure
    .input(
      z.object({
        opaqueDataDescriptor: z.string().min(1),
        opaqueDataValue: z.string().min(1),
        items: z
          .array(
            z.object({
              name: z.string(),
              priceInCents: z.number().int(),
              quantity: z.number().int().positive(),
              image: z.string().optional(),
            })
          )
          .min(1),
        deliveryMethod: z.enum(["shipping", "pickup"]).default("shipping"),
        billingZip: z.string().optional(),
        customerName: z.string().optional(),
        customerEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const { orders } = await import("../drizzle/schema");
      const { TRPCError } = await import("@trpc/server");
      const {
        chargeWithAcceptJsNonce,
        isAuthNetConfigured,
        AuthNetConfigError,
        AuthNetTransactionError,
      } = await import("./authnet");
      const { ENV } = await import("./_core/env");

      if (!isAuthNetConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Credit card payments are not configured. Set AUTHNET_API_LOGIN_ID and AUTHNET_TRANSACTION_KEY.",
        });
      }

      // Server-side amount recompute — never trust a client-supplied total.
      const totalCents = input.items.reduce(
        (s, i) => s + i.priceInCents * i.quantity,
        0
      );
      if (totalCents <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty." });
      }

      const customerName =
        (ctx.user?.name ?? "").trim() ||
        (input.customerName ?? "").trim() ||
        "Guest";
      const customerEmail =
        ctx.user?.email?.trim() || input.customerEmail?.trim() || null;

      const [firstName, ...rest] = customerName.split(/\s+/);
      const billTo = input.billingZip
        ? {
            firstName,
            lastName: rest.join(" ").trim() || firstName,
            address: "",
            city: "",
            state: "",
            zip: input.billingZip,
            country: "US",
          }
        : undefined;

      const invoiceNumber = `bh_${Date.now().toString(36)}`;

      let result;
      try {
        result = await chargeWithAcceptJsNonce({
          opaqueDataDescriptor: input.opaqueDataDescriptor,
          opaqueDataValue: input.opaqueDataValue,
          amountCents: totalCents,
          invoiceNumber,
          description: "Boss Hookah order",
          customer: {
            email: customerEmail,
            id: ctx.user?.id ? String(ctx.user.id) : undefined,
          },
          billTo,
          lineItems: input.items.slice(0, 30).map((i, idx) => ({
            itemId: `bh_${idx + 1}`,
            name: i.name,
            quantity: i.quantity,
            unitPriceCents: i.priceInCents,
          })),
        });
      } catch (err) {
        if (err instanceof AuthNetConfigError) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
        }
        if (err instanceof AuthNetTransactionError) {
          console.error("[AuthNet] gateway error:", err.responseCode, err.messages);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.messages[0]?.description || err.message,
          });
        }
        console.error("[AuthNet] unexpected error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Card payment failed. Please try another payment method.",
        });
      }

      if (!result.approved) {
        const reason = result.messages[0]?.description || "Card was declined.";
        console.warn("[AuthNet] declined:", {
          responseCode: result.responseCode,
          messages: result.messages,
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: reason });
      }

      const db = await getDb();
      if (!db) {
        // The card was already charged. Log loudly so it can be reconciled manually.
        console.error(
          "[AuthNet] CRITICAL: charge succeeded but DB unavailable for order insert.",
          { transactionId: result.transactionId, invoiceNumber }
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Payment captured (ref ${result.transactionId}) but order record failed to save. Contact support.`,
        });
      }

      try {
        const [order] = await db
          .insert(orders)
          .values({
            userId: ctx.user?.id || 0,
            stripePaymentIntentId: result.transactionId || invoiceNumber,
            stripeCheckoutSessionId: invoiceNumber,
            customerName,
            customerPhone: null,
            deliveryMethod: input.deliveryMethod,
            paymentMethod: "authnet",
            status: "paid",
            fulfillmentStatus: "pending",
            totalAmount: totalCents,
            currency: "usd",
            items: JSON.stringify(input.items),
            shippingAddress: null,
          })
          .$returningId();

        console.log("[AuthNet] Order created successfully:", order.id, {
          transactionId: result.transactionId,
          environment: ENV.authnetEnvironment,
        });

        return {
          orderId: order.id,
          transactionId: result.transactionId,
          authCode: result.authCode,
          accountLast4: result.accountNumberLast4,
          totalAmount: totalCents,
          success: true,
        };
      } catch (error: unknown) {
        // The card was already charged. Log loudly so the order can be reconciled.
        console.error(
          "[AuthNet] CRITICAL: charge succeeded but orders insert failed.",
          {
            transactionId: result.transactionId,
            invoiceNumber,
            error: (error as { message?: string })?.message,
          }
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Payment captured (ref ${result.transactionId}) but order record failed to save. Contact support.`,
        });
      }
    }),
});
