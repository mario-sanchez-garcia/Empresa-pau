-- Subscription webhook handlers (invoice.paid, invoice.payment_failed,
-- customer.subscription.deleted) all look up user_entitlements by
-- stripe_customer_id. Without an index this is a sequential scan on every
-- billing cycle event.
create index if not exists ue_stripe_customer_idx
  on public.user_entitlements (stripe_customer_id)
  where stripe_customer_id is not null;
