/**
 * Stripe Integration - Webhook Handler and Checkout Session Creation
 * Orders are saved to Supabase (bh_orders table) instead of MySQL.
 */
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { supabaseAdmin } from "./_core/supabaseAdmin";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Create a Stripe Checkout Session for product purchase
 */
export async function createCheckoutSession(params: {
  userId: string | number;
  userEmail: string;
  userName: string;
  items: Array<{ name: string; priceInCents: number; quantity: number; image?: string }>;
  deliveryMethod: "shipping" | "pickup";
  successUrl: string;
  cancelUrl: string;
}) {
  const { userId, userEmail, userName, items, deliveryMethod, successUrl, cancelUrl } = params;
  console.log('[Stripe] Creating checkout session:', { userId, userEmail, itemCount: items.length });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
    let validImageUrl: string | undefined = undefined;
    if (item.image) {
      try {
        const url = new URL(item.image, 'https://example.com');
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          validImageUrl = item.image.startsWith('http') ? item.image : undefined;
        }
      } catch (e) {
        console.warn('[Stripe] Invalid image URL for item:', item.name, item.image);
      }
    }
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: validImageUrl ? [validImageUrl] : undefined,
        },
        unit_amount: item.priceInCents,
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&delivery_method=${deliveryMethod}`,
      cancel_url: cancelUrl,
      ...(userEmail && userEmail.includes('@') ? { customer_email: userEmail } : {}),
      client_reference_id: String(userId),
      metadata: {
        user_id: String(userId),
        user_name: userName || "Guest",
        delivery_method: deliveryMethod,
        item_count: items.length.toString(),
      },
      allow_promotion_codes: true,
    });

    console.log('[Stripe] Session created:', session.id);
    return { sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error('[Stripe] Error creating session:', error?.message);
    throw error;
  }
}

/**
 * Handle Stripe webhook events — saves orders to Supabase bh_orders table
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id || session.client_reference_id || null;
        const deliveryMethod = (session.metadata?.delivery_method as "shipping" | "pickup") || "shipping";
        const customerName = session.customer_details?.name || session.metadata?.user_name || "Guest";
        const customerEmail = session.customer_details?.email || session.customer_email || null;
        const customerPhone = session.customer_details?.phone || null;

        // Retrieve line items from Stripe
        let items: any[] = [];
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          items = lineItems.data.map(item => ({
            name: item.description,
            priceInCents: item.amount_total,
            quantity: item.quantity,
          }));
        } catch (error) {
          console.error('[Stripe Webhook] Error fetching line items:', error);
        }

        // Get shipping address if available
        let shippingAddress = null;
        if (session.shipping_details?.address) {
          shippingAddress = session.shipping_details.address;
        }

        // Save order to Supabase bh_orders
        const { data: orderData, error: orderError } = await supabaseAdmin
          .from('bh_orders')
          .insert({
            status: 'paid',
            fulfillment_status: 'pending',
            total_amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            stripe_session_id: session.id,
            stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            payment_method: 'stripe',
            delivery_method: deliveryMethod,
            items: items,
            shipping_address: shippingAddress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          console.error('[Stripe Webhook] Error saving order to Supabase:', orderError);
        } else {
          console.log(`[Stripe Webhook] Order saved to Supabase: ${orderData?.id}, session ${session.id}`);
        }

        // Upsert customer in bh_customers if we have an email
        if (customerEmail) {
          await supabaseAdmin
            .from('bh_customers')
            .upsert({
              email: customerEmail,
              name: customerName,
              phone: customerPhone,
              stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await supabaseAdmin
          .from('bh_orders')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent', paymentIntent.id);
        console.log(`[Stripe Webhook] Payment succeeded for intent ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await supabaseAdmin
          .from('bh_orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent', paymentIntent.id);
        console.log(`[Stripe Webhook] Payment failed for intent ${paymentIntent.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await supabaseAdmin
            .from('bh_orders')
            .update({ status: 'refunded', updated_at: new Date().toISOString() })
            .eq('stripe_payment_intent', charge.payment_intent as string);
          console.log(`[Stripe Webhook] Charge refunded for intent ${charge.payment_intent}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
    return { success: true };
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return { success: false, error: String(error) };
  }
}
