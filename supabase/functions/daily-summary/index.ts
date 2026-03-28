// Supabase Edge Function: Daily Earnings Summary
// Deploy: supabase functions deploy daily-summary
// Trigger: pg_cron job at 9 PM IST (3:30 PM UTC)
// 
// Setup pg_cron (run in Supabase SQL Editor):
// SELECT cron.schedule(
//   'daily-earnings-summary',
//   '30 15 * * *',
//   $$
//   SELECT net.http_post(
//     url := '<SUPABASE_URL>/functions/v1/daily-summary',
//     headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
//     body := '{}'::jsonb
//   ) as request_id;
//   $$
// );

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get shop settings for owner phone
    const { data: settings } = await supabase
      .from('shop_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!settings?.owner_phone || !settings?.daily_summary_enabled) {
      return new Response(
        JSON.stringify({ message: 'Daily summary disabled or no owner phone configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get today's date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const today = istDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch today's orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0]);

    const todayOrders = orders || [];

    // Calculate stats
    const stats = {
      todayOrders: todayOrders.length,
      todayEarnings: todayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
      paidAmount: todayOrders.filter((o: any) => o.paid).reduce((s: number, o: any) => s + (o.total || 0), 0),
      unpaidAmount: todayOrders.filter((o: any) => !o.paid).reduce((s: number, o: any) => s + (o.total || 0), 0),
      pending: todayOrders.filter((o: any) => o.status === 'pending').length,
      completed: todayOrders.filter((o: any) => o.status === 'completed').length,
    };

    // Format date
    const dateStr = istDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Build WhatsApp message
    const message = [
      `📊 *LaundroCare — Daily Report*`,
      `━━━━━━━━━━━━━━━━━━`,
      `Date: *${dateStr}*`,
      ``,
      `📦 Total Orders: *${stats.todayOrders}*`,
      `🟢 Completed: ${stats.completed}`,
      `🟡 Pending: ${stats.pending}`,
      ``,
      `💰 *Total Earnings: ₹${stats.todayEarnings.toLocaleString()}*`,
      `✅ Collected: ₹${stats.paidAmount.toLocaleString()}`,
      `⏳ Pending Dues: ₹${stats.unpaidAmount.toLocaleString()}`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `Have a great evening! 🌙`,
    ].join('\n');

    // Check if WhatsApp API is configured
    const whatsappToken = settings.whatsapp_api_token;
    const whatsappPhoneId = settings.whatsapp_phone_id;

    if (whatsappToken && whatsappPhoneId) {
      // Send via WhatsApp Business Cloud API
      const waResponse = await fetch(
        `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `91${settings.owner_phone}`,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      const waData = await waResponse.json();
      console.log('WhatsApp API response:', waData);

      return new Response(
        JSON.stringify({ status: 'sent', stats, whatsapp: waData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      // WhatsApp API not configured, just return the summary data
      console.log('Daily summary generated (WhatsApp API not configured):', stats);
      return new Response(
        JSON.stringify({ status: 'generated', stats, message: 'WhatsApp API not configured. Summary generated but not sent.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Daily summary error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
