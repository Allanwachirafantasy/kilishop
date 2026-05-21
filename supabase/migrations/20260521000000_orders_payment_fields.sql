-- Add payment tracking fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL;

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);
