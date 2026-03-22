import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// Import from pre-compiled server bundle (built by esbuild during Vercel build)
import { appRouter, createContext, stripe, handleWebhookEvent, ENV } from "./_server.mjs";

const app = express();

// Stripe webhook MUST be registered BEFORE express.json() to preserve raw body
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      res.status(400).send("No signature");
      return;
    }
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        ENV.stripeWebhookSecret
      );
      const result = await handleWebhookEvent(event);
      res.json(result);
    } catch (err) {
      console.error("[Stripe Webhook] Error:", err);
      res.status(400).send(`Webhook Error: ${err}`);
    }
  }
);

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
