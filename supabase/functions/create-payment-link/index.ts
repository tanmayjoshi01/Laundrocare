// Supabase Edge Function: Create Razorpay Payment Link
// Deploy: supabase functions deploy create-payment-link
// Secrets: supabase secrets set RAZORPAY_KEY_ID=xxx RAZORPAY_KEY_SECRET=xxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, amount, customerName, customerPhone, description } = await req.json();

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create payment link via Razorpay API
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // in paise (e.g., 10000 = ₹100)
        currency: 'INR',
        description: description || `LaundroCare Order #${orderId}`,
        customer: {
          name: customerName,
          contact: `+91${customerPhone}`,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: true,
        notes: {
          order_id: orderId,
          source: 'laundrocare',
        },
        callback_url: '', // Optional: redirect after payment
        callback_method: 'get',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay error:', data);
      return new Response(
        JSON.stringify({ error: data.error?.description || 'Failed to create payment link' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Return the payment link details
    return new Response(
      JSON.stringify({
        id: data.id,
        short_url: data.short_url,
        amount: data.amount,
        status: data.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
