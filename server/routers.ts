import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { checkoutRouter } from "./checkoutRouter";
import { adminRouter } from "./adminRouter";
import { storeRouter } from "./storeRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    // Returns the currently authenticated user (from Supabase JWT context)
    me: publicProcedure.query(opts => opts.ctx.user),
    // Logout is handled client-side by Supabase; this is a no-op kept for compatibility
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  checkout: checkoutRouter,
  admin: adminRouter,
  store: storeRouter,
});

export type AppRouter = typeof appRouter;
