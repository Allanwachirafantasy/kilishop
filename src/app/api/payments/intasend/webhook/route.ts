import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const computed = hmac.digest('hex');
    return computed === signature;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.INTASEND_WEBHOOK_SECRET;

    // Verify signature if webhook secret is configured
    if (webhookSecret) {
      const signature =
        req.headers.get('x-intasend-signature') ||
        req.headers.get('x-webhook-signature') ||
        '';

      if (signature && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.warn('IntaSend webhook: invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // IntaSend webhook payload structure
    const invoiceId =
      event?.invoice?.invoice_id ||
      event?.invoice_id ||
      event?.id ||
      null;

    const state =
      event?.invoice?.state ||
      event?.state ||
      event?.status ||
      null;

    const apiRef =
      event?.invoice?.api_ref ||
      event?.api_ref ||
      null;

    const transactionId =
      event?.invoice?.mpesa_reference ||
      event?.mpesa_reference ||
      event?.transaction_id ||
      invoiceId ||
      null;

    console.log('IntaSend webhook received:', { invoiceId, state, apiRef, transactionId });

    if (!state) {
      return NextResponse.json({ received: true, message: 'No state in payload' });
    }

    const supabase = getSupabaseAdmin();

    // Map IntaSend states to our payment statuses
    const stateUpper = state.toUpperCase();
    let paymentStatus: string;
    let orderStatus: string | null = null;

    if (stateUpper === 'COMPLETE' || stateUpper === 'COMPLETED' || stateUpper === 'SUCCESS') {
      paymentStatus = 'paid';
      orderStatus = 'processing';
    } else if (stateUpper === 'FAILED' || stateUpper === 'CANCELLED' || stateUpper === 'CANCELED') {
      paymentStatus = 'failed';
    } else if (stateUpper === 'PENDING' || stateUpper === 'PROCESSING') {
      paymentStatus = 'pending';
    } else {
      paymentStatus = state.toLowerCase();
    }

    // Find order by payment_reference (invoice id) or api_ref (order id)
    let orderId: string | null = null;

    if (invoiceId) {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_reference', invoiceId)
        .single();
      orderId = data?.id || null;
    }

    // Fallback: api_ref is the order id
    if (!orderId && apiRef) {
      orderId = apiRef;
    }

    if (!orderId) {
      console.warn('IntaSend webhook: could not find order for', { invoiceId, apiRef });
      return NextResponse.json({ received: true, message: 'Order not found' });
    }

    // Build update payload
    const updatePayload: Record<string, any> = {
      payment_status: paymentStatus,
      transaction_id: transactionId,
    };

    if (paymentStatus === 'paid') {
      updatePayload.paid_at = new Date().toISOString();
      if (orderStatus) updatePayload.status = orderStatus;
    }

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.error('IntaSend webhook: failed to update order', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log(`IntaSend webhook: order ${orderId} updated to payment_status=${paymentStatus}`);

    return NextResponse.json({ received: true, orderId, paymentStatus });
  } catch (error: any) {
    console.error('IntaSend webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
