'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const status = searchParams?.get('status') || 'pending';
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = status === 'COMPLETE' || status === 'SUCCESS' || status === 'complete';
  const isFailed = status === 'FAILED' || status === 'CANCELLED' || status === 'failed';

  return (
    <div className="max-w-md w-full text-center space-y-6">
      {checking ? (
        <>
          <span className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto block" />
          <p className="text-kili-muted">Verifying your payment...</p>
        </>
      ) : isSuccess ? (
        <>
          <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto">
            <Icon name="CheckIcon" size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">Payment Successful! 🎉</h1>
          <p className="text-kili-muted">Your payment was processed successfully. Your order is now being prepared.</p>
          {orderId && (
            <p className="text-sm text-kili-muted">Order ID: <span className="text-primary font-medium">{orderId}</span></p>
          )}
        </>
      ) : isFailed ? (
        <>
          <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center mx-auto">
            <Icon name="XMarkIcon" size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">Payment Failed</h1>
          <p className="text-kili-muted">Your payment could not be processed. Please try again or choose a different payment method.</p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center mx-auto">
            <Icon name="ClockIcon" size={40} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-kili-fg">Payment Pending</h1>
          <p className="text-kili-muted">Your payment is being processed. We'll update your order once confirmed.</p>
          {orderId && (
            <p className="text-sm text-kili-muted">Order ID: <span className="text-primary font-medium">{orderId}</span></p>
          )}
        </>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/homepage" className="btn-primary justify-center">
          <Icon name="HomeIcon" size={16} />
          Continue Shopping
        </Link>
        <Link href="/dashboard" className="btn-secondary justify-center">
          <Icon name="ClipboardDocumentListIcon" size={16} />
          View Orders
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={
          <div className="text-center space-y-4">
            <span className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto block" />
            <p className="text-kili-muted">Loading payment status...</p>
          </div>
        }>
          <PaymentStatusContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
