import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const ownerEmail = Deno.env.get('OWNER_EMAIL')
    const shopName = Deno.env.get('SHOP_NAME') || 'LaundroCare'
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey || !ownerEmail || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    // Create Supabase client with service role (bypasses RLS to read all data)
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date in IST (UTC+5:30)
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000
    const istNow = new Date(now.getTime() + istOffset)
    const today = istNow.toISOString().split('T')[0] // YYYY-MM-DD

    // Get current month for monthly stats
    const currentMonth = today.substring(0, 7) // YYYY-MM

    // ─── FETCH TODAY'S ORDERS ─────────────────────────────
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        total,
        subtotal,
        discount,
        status,
        paid,
        payment_method,
        due_date,
        created_at,
        order_items (
          item,
          service,
          qty,
          unit_price
        )
      `)
      .eq('created_at', today)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // ─── FETCH ALL PENDING ORDERS (not just today) ────────
    const { data: allPendingOrders } = await supabase
      .from('orders')
      .select('id, customer_name, total, due_date, paid')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })

    // ─── FETCH MONTHLY ORDERS FOR STATS ──────────────────
    const { data: monthOrders } = await supabase
      .from('orders')
      .select('total, paid, status')
      .gte('created_at', currentMonth + '-01')
      .lte('created_at', today)

    // ─── CALCULATE TODAY'S STATS ─────────────────────────
    const orders = todayOrders || []
    const totalOrdersToday = orders.length
    const completedToday = orders.filter(o => o.status === 'completed').length
    const pendingToday = orders.filter(o => o.status === 'pending').length
    const totalBilledToday = orders.reduce((s, o) => s + o.total, 0)
    const cashCollectedToday = orders
      .filter(o => o.paid && o.payment_method === 'cash')
      .reduce((s, o) => s + o.total, 0)
    const upiCollectedToday = orders
      .filter(o => o.paid && o.payment_method === 'upi')
      .reduce((s, o) => s + o.total, 0)
    const totalCollectedToday = orders
      .filter(o => o.paid)
      .reduce((s, o) => s + o.total, 0)
    const pendingDuesToday = orders
      .filter(o => !o.paid)
      .reduce((s, o) => s + o.total, 0)
    const totalPcsToday = orders
      .flatMap(o => o.order_items || [])
      .reduce((s, i) => s + i.qty, 0)

    // ─── CALCULATE MONTHLY STATS ─────────────────────────
    const mOrders = monthOrders || []
    const monthTotalBilled = mOrders.reduce((s, o) => s + o.total, 0)
    const monthCollected = mOrders.filter(o => o.paid).reduce((s, o) => s + o.total, 0)
    const monthPending = mOrders.filter(o => !o.paid).reduce((s, o) => s + o.total, 0)

    // ─── FORMAT DATE FOR EMAIL ────────────────────────────
    const displayDate = istNow.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // ─── BUILD TODAY'S ORDERS HTML TABLE ─────────────────
    const ordersTableRows = orders.length === 0
      ? `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94A3B8;font-family:'DM Sans',sans-serif">No orders today</td></tr>`
      : orders.map(o => {
          const itemsSummary = (o.order_items || [])
            .map(i => `${i.item} ×${i.qty}`)
            .join(', ')
          const statusColor = o.status === 'completed' ? '#16A34A' : '#D97706'
          const statusBg = o.status === 'completed' ? '#DCFCE7' : '#FEF3C7'
          const paidColor = o.paid ? '#16A34A' : '#DC2626'
          const paidBg = o.paid ? '#DCFCE7' : '#FEE2E2'
          const payMethod = o.paid
            ? (o.payment_method === 'upi' ? 'UPI' : o.payment_method === 'cash' ? 'Cash' : 'Paid')
            : 'Unpaid'

          return `
            <tr style="border-bottom:1px solid #F1F5F9">
              <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#2563EB;font-weight:600">#${o.id}</td>
              <td style="padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#0F172A">
                <div style="font-weight:600">${o.customer_name}</div>
                <div style="color:#94A3B8;font-size:11px">${itemsSummary}</div>
              </td>
              <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace;font-size:14px;color:#0F172A;font-weight:700">₹${o.total}</td>
              <td style="padding:10px 12px">
                <span style="background:${statusBg};color:${statusColor};padding:3px 8px;border-radius:20px;font-size:11px;font-family:'DM Sans',sans-serif;font-weight:600">
                  ${o.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                </span>
              </td>
              <td style="padding:10px 12px">
                <span style="background:${paidBg};color:${paidColor};padding:3px 8px;border-radius:20px;font-size:11px;font-family:'DM Sans',sans-serif;font-weight:600">
                  ${payMethod}
                </span>
              </td>
            </tr>
          `
        }).join('')

    // ─── BUILD PENDING ORDERS SECTION ────────────────────
    const pendingRows = (allPendingOrders || []).slice(0, 10).map(o => {
      const isOverdue = o.due_date < today
      return `
        <tr style="border-bottom:1px solid #F1F5F9">
          <td style="padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#2563EB">#${o.id}</td>
          <td style="padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#0F172A">${o.customer_name}</td>
          <td style="padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#0F172A">₹${o.total}</td>
          <td style="padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:12px;color:${isOverdue ? '#DC2626' : '#64748B'}">
            ${isOverdue ? '⚠️ ' : ''}${o.due_date}
          </td>
        </tr>
      `
    }).join('')

    const allPendingCount = (allPendingOrders || []).length

    // ─── BUILD FULL HTML EMAIL ────────────────────────────
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shopName} Daily Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'DM Sans',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563EB,#1d4ed8);border-radius:16px;padding:28px 32px;margin-bottom:20px;text-align:center">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:800;color:white;margin-bottom:4px">
        🧺 ${shopName}
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-size:14px;color:rgba(255,255,255,0.8)">
        Daily Report
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;color:white;margin-top:8px">
        ${displayDate}
      </div>
    </div>

    <!-- Today's Stats Cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">

      <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#64748B;margin-bottom:4px">Total billed today</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:#2563EB">₹${totalBilledToday.toLocaleString('en-IN')}</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#94A3B8;margin-top:2px">${totalOrdersToday} order${totalOrdersToday !== 1 ? 's' : ''} · ${totalPcsToday} pcs</div>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#64748B;margin-bottom:4px">Collected today</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:#16A34A">₹${totalCollectedToday.toLocaleString('en-IN')}</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#94A3B8;margin-top:2px">
          Cash ₹${cashCollectedToday} · UPI ₹${upiCollectedToday}
        </div>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#64748B;margin-bottom:4px">Orders status</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
          <div style="text-align:center">
            <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#16A34A">${completedToday}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B">Done</div>
          </div>
          <div style="width:1px;height:32px;background:#E2E8F0"></div>
          <div style="text-align:center">
            <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#D97706">${pendingToday}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B">Pending</div>
          </div>
        </div>
      </div>

      <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#64748B;margin-bottom:4px">Pending dues today</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:${pendingDuesToday > 0 ? '#DC2626' : '#16A34A'}">
          ₹${pendingDuesToday.toLocaleString('en-IN')}
        </div>
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#94A3B8;margin-top:2px">
          ${pendingDuesToday > 0 ? 'Follow up with customers' : 'All payments collected!'}
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0;margin-bottom:20px">
      <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;color:#0F172A;margin-bottom:16px">
        📆 This Month So Far
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F1F5F9">
        <span style="font-family:'DM Sans',sans-serif;font-size:13px;color:#64748B">Total billed</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:#0F172A">₹${monthTotalBilled.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F1F5F9">
        <span style="font-family:'DM Sans',sans-serif;font-size:13px;color:#64748B">Collected</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:#16A34A">₹${monthCollected.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
        <span style="font-family:'DM Sans',sans-serif;font-size:13px;color:#64748B">Still pending</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:${monthPending > 0 ? '#DC2626' : '#16A34A'}">₹${monthPending.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <!-- Today's Orders Table -->
    <div style="background:white;border-radius:12px;border:1px solid #E2E8F0;margin-bottom:20px;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;color:#0F172A">
          📦 Today's Orders
        </div>
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#64748B">
          ${totalOrdersToday} total
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#F8FAFC">
            <th style="text-align:left;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Order</th>
            <th style="text-align:left;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Customer</th>
            <th style="text-align:left;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Amount</th>
            <th style="text-align:left;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Status</th>
            <th style="text-align:left;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Payment</th>
          </tr>
        </thead>
        <tbody>
          ${ordersTableRows}
        </tbody>
      </table>
    </div>

    <!-- All Pending Orders -->
    ${allPendingCount > 0 ? `
    <div style="background:white;border-radius:12px;border:1px solid #E2E8F0;margin-bottom:20px;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #E2E8F0;background:#FFFBEB;display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;color:#92400E">
          ⏳ All Pending Orders
        </div>
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#D97706;font-weight:600">
          ${allPendingCount} orders
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#F8FAFC">
            <th style="text-align:left;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Order</th>
            <th style="text-align:left;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Customer</th>
            <th style="text-align:left;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Amount</th>
            <th style="text-align:left;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${pendingRows}
          ${allPendingCount > 10 ? `<tr><td colspan="4" style="text-align:center;padding:12px;font-family:'DM Sans',sans-serif;font-size:12px;color:#94A3B8">+${allPendingCount - 10} more pending orders</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : `
    <div style="background:#F0FDF4;border-radius:12px;border:1px solid #BBF7D0;padding:16px;margin-bottom:20px;text-align:center">
      <div style="font-family:'DM Sans',sans-serif;font-size:14px;color:#166534;font-weight:600">
        ✅ No pending orders — all cleared!
      </div>
    </div>
    `}

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0">
      <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#94A3B8">
        ${shopName} · Automated Daily Report
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#CBD5E1;margin-top:4px">
        Sent automatically at 9:00 PM IST
      </div>
    </div>

  </div>
</body>
</html>
    `

    // ─── SEND EMAIL VIA RESEND ────────────────────────────
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${shopName} Reports <onboarding@resend.dev>`,
        to: [ownerEmail],
        subject: `📊 ${shopName} Daily Report — ${displayDate} | ₹${totalBilledToday.toLocaleString('en-IN')} billed`,
        html,
      }),
    })

    const emailData = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(emailData)}`)
    }

    console.log('Daily report sent successfully:', emailData.id)

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailData.id,
        stats: {
          date: today,
          totalOrders: totalOrdersToday,
          totalBilled: totalBilledToday,
          totalCollected: totalCollectedToday,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Daily report error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
