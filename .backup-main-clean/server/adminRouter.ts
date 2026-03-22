/**
 * Admin Router — All data operations use Supabase (bh_* tables)
 * MySQL/Drizzle has been fully replaced with Supabase REST API.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "./_core/trpc";
import { supabaseAdmin } from "./_core/supabaseAdmin";

export const adminRouter = router({
  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  getStats: adminProcedure.query(async () => {
    const [
      { count: totalOrders },
      { count: totalCustomers },
      { count: totalProducts },
      { data: revenueData },
      { count: pendingOrders },
    ] = await Promise.all([
      supabaseAdmin.from("bh_orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bh_customers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bh_products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bh_orders").select("total_amount").eq("status", "paid"),
      supabaseAdmin.from("bh_orders").select("*", { count: "exact", head: true }).eq("fulfillment_status", "pending"),
    ]);

    const totalRevenue = (revenueData || []).reduce(
      (sum: number, o: any) => sum + (o.total_amount || 0),
      0
    );

    return {
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      totalRevenue,
      pendingOrders: pendingOrders || 0,
    };
  }),

  // ─── Orders ────────────────────────────────────────────────────────────────
  getOrders: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      let query = supabaseAdmin
        .from("bh_orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + input.pageSize - 1);

      if (input.status && input.status !== "all") {
        query = query.eq("status", input.status);
      }

      const { data, count, error } = await query;
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return {
        orders: data || [],
        total: count || 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.string().optional(),
        fulfillmentStatus: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const update: any = { updated_at: new Date().toISOString() };
      if (input.status) update.status = input.status;
      if (input.fulfillmentStatus) update.fulfillment_status = input.fulfillmentStatus;

      const { error } = await supabaseAdmin
        .from("bh_orders")
        .update(update)
        .eq("id", input.orderId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  deleteOrder: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from("bh_orders")
        .delete()
        .eq("id", input.orderId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  // ─── Customers ─────────────────────────────────────────────────────────────
  getCustomers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      let query = supabaseAdmin
        .from("bh_customers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + input.pageSize - 1);

      if (input.search) {
        query = query.or(
          `name.ilike.%${input.search}%,email.ilike.%${input.search}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return {
        customers: data || [],
        total: count || 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  deleteCustomer: adminProcedure
    .input(z.object({ customerId: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from("bh_customers")
        .delete()
        .eq("id", input.customerId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  // ─── Products / Inventory ──────────────────────────────────────────────────
  getInventory: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.pageSize;
      let query = supabaseAdmin
        .from("bh_products")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(offset, offset + input.pageSize - 1);

      if (input.category) {
        query = query.eq("category", input.category);
      }

      const { data, count, error } = await query;
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return {
        items: data || [],
        total: count || 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  updateInventoryStock: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        stock: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from("bh_products")
        .update({ stock: input.stock })
        .eq("id", input.productId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  addInventoryItem: adminProcedure
    .input(
      z.object({
        name: z.string(),
        brand: z.string().optional(),
        category: z.string(),
        price: z.number(),
        stock: z.number(),
        sku: z.string().optional(),
        badge: z.string().optional(),
        in_stock: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin.from("bh_products").insert({
        name: input.name,
        brand: input.brand || null,
        category: input.category,
        price: input.price,
        stock: input.stock,
        sku: input.sku || null,
        badge: input.badge || null,
        in_stock: input.in_stock,
      });

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  // ─── Store Settings ────────────────────────────────────────────────────────
  getStoreSettings: adminProcedure.query(async () => {
    const { data } = await supabaseAdmin
      .from("bh_store_settings")
      .select("*")
      .limit(1)
      .single();
    return data || null;
  }),

  updateStoreSettings: adminProcedure
    .input(
      z.object({
        storeName: z.string(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        pickupInstructions: z.string().optional(),
        zelleEmail: z.string().optional(),
        zellePhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data: existing } = await supabaseAdmin
        .from("bh_store_settings")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        await supabaseAdmin
          .from("bh_store_settings")
          .update({ ...input, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("bh_store_settings").insert(input);
      }
      return { success: true };
    }),
});
