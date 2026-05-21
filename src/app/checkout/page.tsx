'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { getCartItems, createOrder, formatPrice, type CartItem, type DeliveryAddress } from '@/lib/supabase/services';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'delivery' | 'payment' | 'review';
type PaymentMethod = 'mpesa' | 'card' | 'cod';

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Nyeri', 'Meru', 'Kakamega', 'Kisii', 'Machakos', 'Kilifi',
];

export default function CheckoutPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [step, setStep] = useState<Step>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaPhoneError, setMpesaPhoneError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [mpesaPushSent, setMpesaPushSent] = useState(false);
  const [debugPaymentInfo, setDebugPaymentInfo] = useState<{ status?: number; rawResponse?: string; error?: string } | null>(null);

  const [form, setForm] = useState<DeliveryAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (user) {
      getCartItems(user.id).then(setCartItems).finally(() => setLoadingCart(false));
      if (profile) {
        const nameParts = (profile.fullName || '').split(' ');
        const firstName = nameParts[0] || '';
        const rest = nameParts.slice(1);
        setForm((f) => ({
          ...f,
          firstName,
          lastName: rest.join(' '),
          email: profile.email || '',
          phone: profile.phone || '',
        }));
        setMpesaPhone(profile.phone || '');
      }
    }
  }, [user, authLoading, profile, router]);

  const subtotal = cartItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 350;
  const total = subtotal + shipping;

  const steps: { key: Step; label: string }[] = [
    { key: 'delivery', label: 'Delivery' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleFormChange = (field: keyof DeliveryAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateDelivery = (): boolean => {
    const errors: Partial<Record<keyof DeliveryAddress, string>> = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Valid email required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    if (!form.address.trim()) errors.address = 'Delivery address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.county) errors.county = 'County is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentStep = (): boolean => {
    if (paymentMethod === 'mpesa') {
      if (!mpesaPhone.trim()) {
        setMpesaPhoneError('Phone number is required for M-Pesa');
        return false;
      }
      const cleaned = mpesaPhone.replace(/\s+/g, '');
      if (!/^(07|01|\+2547|\+2541|2547|2541)\d{8,}$/.test(cleaned)) {
        setMpesaPhoneError('Enter a valid Kenyan phone number (e.g. 0712345678)');
        return false;
      }
    }
    setMpesaPhoneError('');
    return true;
  };

  const handleNext = () => {
    if (step === 'delivery') {
      if (validateDelivery()) setStep('payment');
    } else if (step === 'payment') {
      if (validatePaymentStep()) setStep('review');
    } else if (step === 'review') {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('delivery');
    else if (step === 'review') setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return;
    setPlacingOrder(true);
    setProcessingPayment(false);
    setOrderError('');
    setPaymentError('');

    try {
      // 1. Create order in Supabase
      const order = await createOrder(user.id, cartItems, form, paymentMethod, shipping, 0);
      setOrderNumber(order.orderNumber);
      setOrderId(order.id);

      // 2. For COD, mark as placed immediately
      if (paymentMethod === 'cod') {
        setOrderPlaced(true);
        return;
      }

      // 3. Initiate IntaSend payment
      setProcessingPayment(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      let paymentRes: Response;
      try {
        paymentRes = await fetch('/api/payments/intasend/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentMethod,
            phoneNumber: paymentMethod === 'mpesa' ? mpesaPhone.replace(/\s+/g, '') : undefined,
            amount: total,
            currency: 'KES',
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
          }),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        if (fetchErr?.name === 'AbortError') {
          setPaymentError('Payment request timed out. Please check your connection and try again.');
          return;
        }
        throw fetchErr;
      } finally {
        clearTimeout(timeoutId);
      }

      const paymentData = await paymentRes.json();

      // DEBUG: capture raw response details
      setDebugPaymentInfo({
        status: paymentData.status,
        rawResponse: paymentData.rawResponse,
        error: paymentData.error,
      });

      if (!paymentRes.ok || !paymentData.success) {
        setPaymentError(
          `[DEBUG] Status: ${paymentData.status ?? paymentRes.status}\n` +
          `Raw: ${paymentData.rawResponse ?? paymentData.error ?? 'No response body'}`
        );
        return;
      }

      if (paymentMethod === 'mpesa') {
        setMpesaPushSent(true);
        setOrderPlaced(true);
      } else if (paymentMethod === 'card' && paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
        return;
      } else {
        setOrderPlaced(true);
      }
    } catch (err: any) {
      console.error('Place order error:', err);
      setOrderError(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
      setProcessingPayment(false);
    }
  };

  if (authLoading || loadingCart) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-kili-fg mb-2">Your cart is empty</h2>
            <Link href="/product-listing" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto">
              <Icon name="CheckIcon" size={40} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-kili-fg mb-2">Order Confirmed! 🎉</h1>
              <p className="text-kili-muted">Thank you, {form.firstName}! Your order has been placed successfully.</p>
            </div>
            <div className="card-dark rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Order Number</span>
                <span className="text-kili-fg font-semibold">#{orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Estimated Delivery</span>
                <span className="text-kili-fg font-semibold">2-3 Business Days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Total</span>
                <span className="text-primary font-bold text-base">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Payment Method</span>
                <span className="text-kili-fg capitalize">
                  {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}
                </span>
              </div>
              {mpesaPushSent && (
                <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                  📱 M-Pesa STK Push sent to <strong>{mpesaPhone}</strong>. Enter your PIN to complete payment.
                </div>
              )}
            </div>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-kili-bg">
      <Header />
      <main className="flex-1">
        <div className="border-b border-kili-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-kili-subtle">
              <Link href="/homepage" className="hover:text-primary transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
              <Icon name="ChevronRightIcon" size={14} />
              <span className="text-kili-fg">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg mb-6">Checkout</h1>

          {/* Step indicator */}
          <div className="flex items-center mb-8 max-w-sm">
            {steps.map((s, idx) => (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`step-dot ${idx < stepIndex ? 'completed' : idx === stepIndex ? 'active' : 'inactive'}`}>
                    {idx < stepIndex ? <Icon name="CheckIcon" size={14} /> : <span>{idx + 1}</span>}
                  </div>
                  <span className={`text-xs font-medium hidden xs:block ${idx === stepIndex ? 'text-primary' : 'text-kili-subtle'}`}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`step-line mx-2 mb-5 ${idx < stepIndex ? 'completed' : ''}`} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 1: Delivery */}
              {step === 'delivery' && (
                <div className="card-dark rounded-xl p-5 sm:p-6 space-y-5">
                  <h2 className="text-base font-semibold text-kili-fg flex items-center gap-2">
                    <Icon name="MapPinIcon" size={18} className="text-primary" />
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { field: 'firstName' as const, label: 'First Name', placeholder: 'Amara', type: 'text' },
                      { field: 'lastName' as const, label: 'Last Name', placeholder: 'Osei', type: 'text' },
                      { field: 'email' as const, label: 'Email', placeholder: 'your@email.com', type: 'email' },
                      { field: 'phone' as const, label: 'Phone', placeholder: '0712345678', type: 'tel' },
                    ].map(({ field, label, placeholder, type }) => (
                      <div key={field}>
                        <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">{label} *</label>
                        <input
                          type={type}
                          value={form[field] as string}
                          onChange={(e) => handleFormChange(field, e.target.value)}
                          placeholder={placeholder}
                          className={`input-dark ${formErrors[field] ? 'border-red-500' : ''}`}
                        />
                        {formErrors[field] && <p className="text-xs text-red-500 mt-1">{formErrors[field]}</p>}
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="123 Kenyatta Avenue, Apt 4B"
                        className={`input-dark ${formErrors.address ? 'border-red-500' : ''}`}
                      />
                      {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">City *</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => handleFormChange('city', e.target.value)}
                        placeholder="Nairobi"
                        className={`input-dark ${formErrors.city ? 'border-red-500' : ''}`}
                      />
                      {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">County *</label>
                      <select
                        value={form.county}
                        onChange={(e) => handleFormChange('county', e.target.value)}
                        className={`input-dark ${formErrors.county ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select county</option>
                        {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {formErrors.county && <p className="text-xs text-red-500 mt-1">{formErrors.county}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => handleFormChange('postalCode', e.target.value)}
                        placeholder="00100"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">Order Notes</label>
                      <input
                        type="text"
                        value={form.notes || ''}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Special delivery instructions..."
                        className="input-dark"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Payment */}
              {step === 'payment' && (
                <div className="card-dark rounded-xl p-5 sm:p-6 space-y-5">
                  <h2 className="text-base font-semibold text-kili-fg flex items-center gap-2">
                    <Icon name="CreditCardIcon" size={18} className="text-primary" />
                    Payment Method
                  </h2>

                  {/* IntaSend badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-kili-elevated border border-kili-border text-xs text-kili-muted">
                    <span className="text-green-500">🔒</span>
                    Payments secured by <span className="font-semibold text-kili-fg">IntaSend</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'mpesa' as const, label: 'M-Pesa', desc: 'Pay via M-Pesa STK Push — instant & secure', icon: '📱' },
                      { value: 'card' as const, label: 'Credit / Debit Card', desc: 'Visa, Mastercard — redirects to secure checkout', icon: '💳' },
                      { value: 'cod' as const, label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === method.value ? 'border-primary bg-primary/5' : 'border-kili-border hover:border-kili-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={() => {
                            setPaymentMethod(method.value);
                            setMpesaPhoneError('');
                          }}
                          className="sr-only"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-kili-fg">{method.label}</p>
                          <p className="text-xs text-kili-muted">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.value ? 'border-primary' : 'border-kili-border'}`}>
                          {paymentMethod === method.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* M-Pesa phone input */}
                  {paymentMethod === 'mpesa' && (
                    <div className="mt-2 p-4 rounded-xl bg-kili-elevated border border-kili-border space-y-3">
                      <p className="text-sm font-medium text-kili-fg flex items-center gap-2">
                        <span>📱</span> M-Pesa Phone Number
                      </p>
                      <div>
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => {
                            setMpesaPhone(e.target.value);
                            setMpesaPhoneError('');
                          }}
                          placeholder="0712 345 678"
                          className={`input-dark ${mpesaPhoneError ? 'border-red-500' : ''}`}
                        />
                        {mpesaPhoneError && <p className="text-xs text-red-500 mt-1">{mpesaPhoneError}</p>}
                        <p className="text-xs text-kili-muted mt-1.5">
                          You'll receive an STK Push prompt on this number. Enter your M-Pesa PIN to complete payment.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card info */}
                  {paymentMethod === 'card' && (
                    <div className="mt-2 p-4 rounded-xl bg-kili-elevated border border-kili-border">
                      <p className="text-sm text-kili-muted flex items-center gap-2">
                        <span>💳</span>
                        You'll be redirected to IntaSend's secure card checkout page after placing your order.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Review */}
              {step === 'review' && (
                <div className="card-dark rounded-xl p-5 sm:p-6 space-y-5">
                  <h2 className="text-base font-semibold text-kili-fg">Review Your Order</h2>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-kili-border last:border-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-kili-elevated shrink-0">
                          <AppImage src={item.product?.imageUrl || ''} alt={item.product?.name || ''} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-kili-fg line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-kili-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-kili-fg shrink-0">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-kili-elevated rounded-xl space-y-2 text-sm">
                    <p className="font-medium text-kili-fg">Delivery to:</p>
                    <p className="text-kili-muted">{form.firstName} {form.lastName}</p>
                    <p className="text-kili-muted">{form.address}, {form.city}, {form.county}</p>
                    <p className="text-kili-muted">{form.phone}</p>
                  </div>
                  <div className="p-4 bg-kili-elevated rounded-xl space-y-1 text-sm">
                    <p className="font-medium text-kili-fg">Payment:</p>
                    <p className="text-kili-muted">
                      {paymentMethod === 'mpesa' ? `📱 M-Pesa — ${mpesaPhone}` : paymentMethod === 'card' ? '💳 Credit/Debit Card' : '💵 Cash on Delivery'}
                    </p>
                  </div>
                  {(orderError || paymentError) && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                      {paymentError ? (
                        <pre className="whitespace-pre-wrap break-all text-xs">{paymentError}</pre>
                      ) : (
                        orderError
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3">
                {step !== 'delivery' && (
                  <button onClick={handleBack} className="btn-secondary py-2.5 px-5">
                    <Icon name="ArrowLeftIcon" size={16} />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={placingOrder || processingPayment}
                  className="btn-primary flex-1 justify-center py-2.5"
                >
                  {placingOrder || processingPayment ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : step === 'review' ? (
                    <>
                      <Icon name="CheckIcon" size={16} />
                      {paymentMethod === 'mpesa' ? 'Place Order & Send STK Push' : paymentMethod === 'card' ? 'Place Order & Pay by Card' : 'Place Order'}
                    </>
                  ) : (
                    <>Continue <Icon name="ArrowRightIcon" size={16} /></>
                  )}
                </button>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="card-dark rounded-xl p-5 sticky top-24 space-y-4">
                <h2 className="text-base font-semibold text-kili-fg">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-kili-muted">
                      <span className="line-clamp-1 flex-1 mr-2">{item.product?.name} × {item.quantity}</span>
                      <span className="shrink-0">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-kili-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-kili-muted">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                </div>
                <div className="divider" />
                <div className="flex justify-between font-semibold text-kili-fg">
                  <span>Total</span>
                  <span className="text-primary text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}