CREATE TABLE public.waitlist (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  comunidad       text NOT NULL CHECK (comunidad IN ('madrid','cataluna','otra')),
  curso           text NOT NULL CHECK (curso IN ('1bach','2bach')),
  referral_code   text NOT NULL UNIQUE,
  referred_by     text REFERENCES public.waitlist(referral_code),
  referral_count  integer NOT NULL DEFAULT 0,
  price_locked    integer NOT NULL DEFAULT 59,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX waitlist_referred_by_idx ON public.waitlist (referred_by);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- Sin policies: solo service role escribe/lee.
