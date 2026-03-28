// Supabase Edge Function: Razorpay Webhook Handler
// Deploy: supabase functions deploy razorpay-webhook
// Configure webhook URL in Razorpay Dashboard: https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
// Secrets: supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSig === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    // Verify webhook signature
    if (webhookSecret && signature) {
      const isValid = await verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log('Razorpay webhook event:', event);

    if (event === 'payment_link.paid') {
      const paymentLink = payload.payload.payment_link.entity;
      const orderId = paymentLink.notes?.order_id;

      if (orderId) {
        // Update order in Supabase
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { error } = await supabase
          .from('orders')
          .update({
            paid: true,
            payment_method: 'online',
          })
          .eq('id', orderId);

        if (error) {
          console.error('Failed to update order:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        console.log(`Order ${orderId} marked as paid via Razorpay`);
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
