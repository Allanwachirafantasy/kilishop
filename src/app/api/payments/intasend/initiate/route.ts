import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const INTASEND_API_BASE = 'https://payment.intasend.com/api/v1';
// Switch to 'https://payment.intasend.com/api/v1' for production

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    // Validate amount is positive
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    let intasendResponse: any;

    if (paymentMethod === 'mpesa') {
      // M-Pesa STK Push
      const mpesaPayload = {
        public_key: publicKey,
        currency,
        amount: parsedAmount,
        phone_number: phoneNumber,
        email: email || '',
        first_name: firstName || '',
        last_name: lastName || '',
        api_ref: orderId,
        comment: `Payment for order ${orderId}`,
      };

      const response = await fetch(`${INTASEND_API_BASE}/payment/mpesa-stk-push/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(mpesaPayload),
      });

      intasendResponse = await response.json();

      if (!response.ok) {
        console.error('IntaSend M-Pesa error:', intasendResponse);
        return NextResponse.json(
          { error: intasendResponse?.detail || intasendResponse?.message || 'M-Pesa payment initiation failed' },
          { status: response.status }
        );
      }
    } else if (paymentMethod === 'card') {
      // Card payment — create a checkout link
      const cardPayload = {
        public_key: publicKey,
        currency,
        amount: parsedAmount,
        email: email || '',
        first_name: firstName || '',
        last_name: lastName || '',
        api_ref: orderId,
        comment: `Payment for order ${orderId}`,
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/payment-status?orderId=${orderId}`,
      };

      const response = await fetch(`${INTASEND_API_BASE}/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(cardPayload),
      });

      intasendResponse = await response.json();

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

    // Save payment reference to order
    const supabase = getSupabaseAdmin();
    const paymentRef = intasendResponse?.invoice?.invoice_id || intasendResponse?.id || intasendResponse?.checkout_id || null;

    if (paymentRef) {
      await supabase
        .from('orders')
        .update({ payment_reference: paymentRef, payment_status: 'pending' })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      paymentMethod,
      invoiceId: paymentRef,
      checkoutUrl: intasendResponse?.url || intasendResponse?.checkout_url || null,
      message: paymentMethod === 'mpesa' ?'STK Push sent to your phone. Enter your M-Pesa PIN to complete payment.' :'Redirecting to card payment...',
      raw: intasendResponse,
    });
  } catch (error: any) {
    console.error('IntaSend initiate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
