'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { formatPrice } from '@/lib/sampleData';

type Step = 'delivery' | 'payment' | 'review';

interface DeliveryForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  notes: string;
}

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Nyeri', 'Meru', 'Kakamega', 'Kisii', 'Machakos', 'Kilifi',
];

const orderItems = [
  { name: 'Samsung Galaxy A54 5G', qty: 1, price: 28999, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&auto=format&fit=crop&q=80' },
  { name: 'Wireless Earbuds Pro', qty: 2, price: 3499, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80' },
  { name: 'Vitamin C Face Serum', qty: 1, price: 1899, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&auto=format&fit=crop&q=80' },
];

const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
const shipping = 0;
const total = subtotal + shipping;

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cod'>('mpesa');
  const [form, setForm] = useState<DeliveryForm>({
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
  const [formErrors, setFormErrors] = useState<Partial<DeliveryForm>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const steps: { key: Step; label: string; icon: string }[] = [
    { key: 'delivery', label: 'Delivery', icon: '📦' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'review', label: 'Review', icon: '✅' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleFormChange = (field: keyof DeliveryForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateDelivery = (): boolean => {
    const errors: Partial<DeliveryForm> = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Valid email required';
    if (!form.phone.trim() || !/^(\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Valid Kenyan phone number required (e.g. 0712345678)';
    }
    if (!form.address.trim()) errors.address = 'Delivery address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.county) errors.county = 'County is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 'delivery') {
      if (validateDelivery()) setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    } else if (step === 'review') {
      setOrderPlaced(true);
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('delivery');
    else if (step === 'review') setStep('payment');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-kili-bg">
        <Header cartCount={0} />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Success animation */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto">
              <Icon name="CheckIcon" size={40} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-kili-fg mb-2">
                Order Confirmed! 🎉
              </h1>
              <p className="text-kili-muted">
                Thank you, {form.firstName || 'Valued Customer'}! Your order has been placed successfully.
              </p>
            </div>
            <div className="card-dark rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Order Number</span>
                <span className="text-kili-fg font-semibold">#KSH-{Math.floor(Math.random() * 900000 + 100000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Estimated Delivery</span>
                <span className="text-kili-fg font-semibold">2-3 Business Days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Total Paid</span>
                <span className="text-primary font-bold text-base">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-kili-muted">Payment Method</span>
                <span className="text-kili-fg capitalize">{paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <Link href="/homepage" className="btn-primary justify-center">
                <Icon name="HomeIcon" size={16} />
                Continue Shopping
              </Link>
              <Link href="/homepage" className="btn-secondary justify-center">
                Track Order
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
      <Header cartCount={orderItems.length} />

      <main className="flex-1">
        {/* Breadcrumb */}
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
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-kili-fg mb-6">
            Checkout
          </h1>

          {/* Step indicator */}
          <div className="flex items-center mb-8 max-w-sm" role="list" aria-label="Checkout steps">
            {steps.map((s, idx) => (
              <React.Fragment key={s.key}>
                <div
                  className="flex flex-col items-center gap-1"
                  role="listitem"
                  aria-current={s.key === step ? 'step' : undefined}
                >
                  <div
                    className={`step-dot ${
                      idx < stepIndex ? 'completed' : idx === stepIndex ? 'active' : 'inactive'
                    }`}
                  >
                    {idx < stepIndex ? (
                      <Icon name="CheckIcon" size={14} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden xs:block ${idx === stepIndex ? 'text-primary' : 'text-kili-subtle'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`step-line mx-2 mb-5 ${idx < stepIndex ? 'completed' : ''}`} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Step content */}
            <div className="lg:col-span-2 space-y-6">

              {/* STEP 1: Delivery */}
              {step === 'delivery' && (
                <div className="card-dark rounded-xl p-5 sm:p-6 space-y-5">
                  <h2 className="text-base font-semibold text-kili-fg flex items-center gap-2">
                    <Icon name="MapPinIcon" size={18} className="text-primary" />
                    Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First name */}
                    <div>
                      <label htmlFor="firstName" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                        placeholder="Amara"
                        className={`input-dark ${formErrors.firstName ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.firstName ? 'firstName-error' : undefined}
                        autoComplete="given-name"
                      />
                      {formErrors.firstName && (
                        <p id="firstName-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.firstName}</p>
                      )}
                    </div>

                    {/* Last name */}
                    <div>
                      <label htmlFor="lastName" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={form.lastName}
                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                        placeholder="Osei"
                        className={`input-dark ${formErrors.lastName ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.lastName ? 'lastName-error' : undefined}
                        autoComplete="family-name"
                      />
                      {formErrors.lastName && (
                        <p id="lastName-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.lastName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="amara@example.com"
                        className={`input-dark ${formErrors.email ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.email ? 'email-error' : undefined}
                        autoComplete="email"
                      />
                      {formErrors.email && (
                        <p id="email-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="0712 345 678"
                        className={`input-dark ${formErrors.phone ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                        autoComplete="tel"
                      />
                      {formErrors.phone && (
                        <p id="phone-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        Street Address *
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={form.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="123 Ngong Road, Apartment 4B"
                        className={`input-dark ${formErrors.address ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.address ? 'address-error' : undefined}
                        autoComplete="street-address"
                      />
                      {formErrors.address && (
                        <p id="address-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.address}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="city" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={form.city}
                        onChange={(e) => handleFormChange('city', e.target.value)}
                        placeholder="Nairobi"
                        className={`input-dark ${formErrors.city ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.city ? 'city-error' : undefined}
                        autoComplete="address-level2"
                      />
                      {formErrors.city && (
                        <p id="city-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.city}</p>
                      )}
                    </div>

                    {/* County */}
                    <div>
                      <label htmlFor="county" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        County *
                      </label>
                      <select
                        id="county"
                        value={form.county}
                        onChange={(e) => handleFormChange('county', e.target.value)}
                        className={`input-dark ${formErrors.county ? 'border-red-500' : ''}`}
                        aria-describedby={formErrors.county ? 'county-error' : undefined}
                        autoComplete="address-level1"
                      >
                        <option value="" className="bg-kili-elevated">Select county</option>
                        {KENYAN_COUNTIES.map((c) => (
                          <option key={c} value={c} className="bg-kili-elevated">{c}</option>
                        ))}
                      </select>
                      {formErrors.county && (
                        <p id="county-error" className="text-xs text-red-400 mt-1" role="alert">{formErrors.county}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="text-xs font-medium text-kili-muted uppercase tracking-wide block mb-1.5">
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Any special instructions for delivery..."
                        rows={3}
                        className="input-dark resize-none"
                        autoComplete="off"
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

                  <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
                    {/* M-Pesa */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'mpesa' ?'border-primary bg-primary/5' :'border-kili-border hover:border-kili-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="mpesa"
                        checked={paymentMethod === 'mpesa'}
                        onChange={() => setPaymentMethod('mpesa')}
                        className="mt-1 accent-primary"
                        aria-label="Pay with M-Pesa"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📱</span>
                          <span className="text-sm font-semibold text-kili-fg">M-Pesa</span>
                          <span className="badge-new text-xs">Popular</span>
                        </div>
                        <p className="text-xs text-kili-muted">
                          Pay securely via M-Pesa. You will receive an STK push to complete payment.
                        </p>
                        {paymentMethod === 'mpesa' && (
                          <div className="mt-3">
                            <label htmlFor="mpesa-phone" className="text-xs text-kili-muted block mb-1.5">
                              M-Pesa Phone Number
                            </label>
                            <input
                              id="mpesa-phone"
                              type="tel"
                              defaultValue={form.phone}
                              placeholder="0712 345 678"
                              className="input-dark text-sm py-2"
                              aria-label="M-Pesa phone number"
                            />
                            <p className="text-xs text-kili-subtle mt-1">
                              Ensure this is your registered M-Pesa number
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Card */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card' ?'border-primary bg-primary/5' :'border-kili-border hover:border-kili-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 accent-primary"
                        aria-label="Pay with credit or debit card"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💳</span>
                          <span className="text-sm font-semibold text-kili-fg">Credit / Debit Card</span>
                        </div>
                        <p className="text-xs text-kili-muted">
                          Visa, Mastercard accepted. Secure 3D authentication.
                        </p>
                        {paymentMethod === 'card' && (
                          <div className="mt-3 space-y-3">
                            <input
                              type="text"
                              placeholder="Card number (e.g. 4111 1111 1111 1111)"
                              className="input-dark text-sm py-2"
                              aria-label="Card number"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="MM / YY"
                                className="input-dark text-sm py-2"
                                aria-label="Card expiry date"
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                className="input-dark text-sm py-2"
                                aria-label="Card CVV"
                              />
                            </div>
                            <p className="text-xs text-kili-subtle flex items-center gap-1">
                              <Icon name="LockClosedIcon" size={12} />
                              Payment gateway integration ready (Flutterwave / Stripe)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod' ?'border-primary bg-primary/5' :'border-kili-border hover:border-kili-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-primary"
                        aria-label="Pay cash on delivery"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💵</span>
                          <span className="text-sm font-semibold text-kili-fg">Cash on Delivery</span>
                        </div>
                        <p className="text-xs text-kili-muted">
                          Pay with cash when your order arrives. Available in Nairobi only.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: Review */}
              {step === 'review' && (
                <div className="space-y-4">
                  {/* Delivery summary */}
                  <div className="card-dark rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-kili-fg flex items-center gap-2">
                        <Icon name="MapPinIcon" size={16} className="text-primary" />
                        Delivery To
                      </h2>
                      <button
                        onClick={() => setStep('delivery')}
                        className="text-xs text-primary hover:text-primary-light transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-sm text-kili-muted space-y-0.5">
                      <p className="text-kili-fg font-medium">{form.firstName} {form.lastName}</p>
                      <p>{form.address}</p>
                      <p>{form.city}, {form.county}</p>
                      <p>{form.phone}</p>
                    </div>
                  </div>

                  {/* Payment summary */}
                  <div className="card-dark rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-kili-fg flex items-center gap-2">
                        <Icon name="CreditCardIcon" size={16} className="text-primary" />
                        Payment Method
                      </h2>
                      <button
                        onClick={() => setStep('payment')}
                        className="text-xs text-primary hover:text-primary-light transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-kili-muted capitalize">
                      {paymentMethod === 'mpesa' ? '📱 M-Pesa' : paymentMethod === 'card' ? '💳 Credit/Debit Card' : '💵 Cash on Delivery'}
                    </p>
                  </div>

                  {/* Items summary */}
                  <div className="card-dark rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-kili-fg mb-3">
                      Order Items ({orderItems.length})
                    </h2>
                    <div className="space-y-3">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-kili-elevated"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-kili-fg line-clamp-1">{item.name}</p>
                            <p className="text-xs text-kili-subtle">Qty: {item.qty}</p>
                          </div>
                          <span className="text-sm font-medium text-kili-fg shrink-0">
                            {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                {step !== 'delivery' ? (
                  <button
                    onClick={handleBack}
                    className="btn-secondary py-2.5 px-5"
                  >
                    <Icon name="ArrowLeftIcon" size={16} />
                    Back
                  </button>
                ) : (
                  <Link href="/cart" className="btn-secondary py-2.5 px-5">
                    <Icon name="ArrowLeftIcon" size={16} />
                    Back to Cart
                  </Link>
                )}

                <button
                  onClick={handleNext}
                  className="btn-primary py-2.5 px-6"
                >
                  {step === 'review' ? (
                    <>
                      <Icon name="CheckIcon" size={16} />
                      Place Order
                    </>
                  ) : (
                    <>
                      Continue
                      <Icon name="ArrowRightIcon" size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="card-dark rounded-xl p-5 sticky top-24 space-y-4">
                <h2 className="text-base font-semibold text-kili-fg">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-kili-elevated"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kili-elevated border border-kili-border text-xs text-kili-muted flex items-center justify-center font-medium">
                          {item.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-kili-fg line-clamp-2">{item.name}</p>
                      </div>
                      <span className="text-xs font-medium text-kili-fg shrink-0">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-kili-muted">
                    <span>Subtotal</span>
                    <span className="text-kili-fg">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-kili-muted">
                    <span>Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                </div>

                <div className="divider" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-kili-fg">Total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-kili-subtle bg-kili-elevated rounded-lg px-3 py-2">
                  <Icon name="ShieldCheckIcon" size={14} className="text-green-400 shrink-0" />
                  Secure checkout. Your data is protected.
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