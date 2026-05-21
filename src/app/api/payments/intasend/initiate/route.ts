import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const INTASEND_API_BASE = 'https://payment.intasend.com/api/v1';
const FETCH_TIMEOUT_MS = 30000; // 30 seconds

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentMethod, phoneNumber, amount, currency = 'KES', email, firstName, lastName } = body;

    if (!orderId || !paymentMethod || !amount) {
      return NextResponse.json({ error: 'Missing required fields: orderId, paymentMethod, amount' }, { status: 400 });
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required for M-Pesa payments' }, { status: 400 });
    }

    const secretKey = process.env.INTASEND_SECRET_KEY;
    const publicKey = process.env.INTASEND_PUBLIC_KEY;

    if (!secretKey || !publicKey) {
      console.error('IntaSend: Missing INTASEND_SECRET_KEY or INTASEND_PUBLIC_KEY');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    // Validate amount is positive
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Format phone number to 2547XXXXXXXX or 2541XXXXXXXX
    let formattedPhone = phoneNumber || '';
    if (paymentMethod === 'mpesa') {
      formattedPhone = formattedPhone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.slice(1);
      }
    }

    let intasendResponse: any;

    if (paymentMethod === 'mpesa') {
      const mpesaPayload = {
        amount: Number(parsedAmount),
        currency,
        phone_number: formattedPhone,
        email: email || '',
        api_ref: orderId,
      };

      console.log('Sending IntaSend STK Push request...');
      console.log(mpesaPayload);

      let response: Response;
      try {
        response = await fetchWithTimeout(
          `${INTASEND_API_BASE}/payment/mpesa-stk-push/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${secretKey}`,
            },
            body: JSON.stringify(mpesaPayload),
          },
          FETCH_TIMEOUT_MS
        );
      } catch (fetchErr: any) {
        if (fetchErr?.name === 'AbortError') {
          console.error('IntaSend STK Push request timed out after', FETCH_TIMEOUT_MS, 'ms');
          return NextResponse.json({ error: 'Payment request timed out. Please try again.' }, { status: 504 });
        }
        throw fetchErr;
      }

      console.log('IntaSend STK Push status:', response.status);
      intasendResponse = await response.json();
      console.log('IntaSend STK Push response:', intasendResponse);

      if (!response.ok) {
        console.error('IntaSend M-Pesa error:', intasendResponse);
        return NextResponse.json(
          { error: intasendResponse?.detail || intasendResponse?.message || 'M-Pesa payment initiation failed' },
          { status: response.status }
        );
      }
    } else if (paymentMethod === 'card') {
      const cardPayload = {
        amount: Number(parsedAmount),
        currency,
        email: email || '',
        first_name: firstName || '',
        last_name: lastName || '',
        api_ref: orderId,
        comment: `Payment for order ${orderId}`,
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/payment-status?orderId=${orderId}`,
      };

      console.log('Sending IntaSend card checkout request...');
      console.log(cardPayload);

      let response: Response;
      try {
        response = await fetchWithTimeout(
          `${INTASEND_API_BASE}/checkout/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${secretKey}`,
            },
            body: JSON.stringify(cardPayload),
          },
          FETCH_TIMEOUT_MS
        );
      } catch (fetchErr: any) {
        if (fetchErr?.name === 'AbortError') {
          console.error('IntaSend card checkout request timed out after', FETCH_TIMEOUT_MS, 'ms');
          return NextResponse.json({ error: 'Payment request timed out. Please try again.' }, { status: 504 });
        }
        throw fetchErr;
      }

      console.log('IntaSend card checkout status:', response.status);
      intasendResponse = await response.json();
      console.log('IntaSend card checkout response:', intasendResponse);

      if (!response.ok) {
        console.error('IntaSend Card error:', intasendResponse);
        return NextResponse.json(
          { error: intasendResponse?.detail || intasendResponse?.message || 'Card payment initiation failed' },
          { status: response.status }
        );
      }
    } else {
      return NextResponse.json({ error: 'Unsupported payment method. Use mpesa or card.' }, { status: 400 });
    }

    // Save payment reference to order immediately — do NOT wait for webhook
    const supabase = getSupabaseAdmin();
    const paymentRef =
      intasendResponse?.invoice?.invoice_id ||
      intasendResponse?.id ||
      intasendResponse?.checkout_id ||
      null;

    if (paymentRef) {
      await supabase
        .from('orders')
        .update({ payment_reference: paymentRef, payment_status: 'pending' })
        .eq('id', orderId);
    }

    // Return immediately — webhook will update payment status later
    return NextResponse.json({
      success: true,
      paymentMethod,
      invoiceId: paymentRef,
      checkoutUrl: intasendResponse?.url || intasendResponse?.checkout_url || null,
      message:
        paymentMethod === 'mpesa' ?'STK Push sent to your phone. Enter your M-Pesa PIN to complete payment.' :'Redirecting to card payment...',
      raw: intasendResponse,
    });
  } catch (error: any) {
    console.error('IntaSend initiate error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
