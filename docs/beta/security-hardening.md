# Pausia beta security hardening

This document tracks the security controls required before inviting beta users.

## Implemented in the repo

- Server-only AI usage helpers. `app/lib/aiUsage.ts` can no longer be imported by client components.
- Server-only internal allowlist helper. Internal email checks stay on API routes.
- AI rate limits now fail closed in production if usage tracking is unavailable.
- `/api/chat`, `/api/planning` and `/api/simulacro` require a real Supabase `Authorization: Bearer <access_token>`.
- `/api/checkout/parent-session` has a lightweight server-side rate limit by IP and checkout token.
- `/api/checkout/parent-session` reuses an open Stripe Checkout session instead of creating repeated sessions for the same parent link.
- Stripe webhook signature verification is required before applying entitlements.
- Security headers are sent globally:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` for camera, microphone, geolocation and payment

## Must verify in Supabase before beta

- RLS is enabled in production for every user-data table:
  - `historial_examenes`
  - `historial_simulacros`
  - `flashcards`
  - `canvases`
  - `canvas_images`
  - `ai_usage_events`
  - `camino_user_progress`
  - `camino_daily_missions`
  - `camino_task_completions`
  - `camino_route_settings`
  - `camino_xp_events`
  - `parent_checkout_links`
  - `user_entitlements`
  - `billing_events`
- Auth email/password protection is enabled:
  - Supabase Auth rate limits are active.
  - CAPTCHA or Turnstile is configured for signup/login if public signup is enabled.
  - Site URL and redirect URLs only include Pausia production and trusted preview/local URLs.
- Storage bucket policies are scoped to the authenticated owner, especially `zona-images`.

## Must verify in Vercel before beta

- Environment variables exist only in Vercel Project Settings, never in Git:
  - `ANTHROPIC_API_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `INTERNAL_USER_EMAILS`
- `NEXT_PUBLIC_APP_URL` points to the real production domain.
- Vercel deployment protection/log access is restricted to the team.

## Operational rule

If any key was ever pasted into a public channel, screenshot, commit, or support ticket, rotate it before beta. Treat screenshots as potentially shareable artifacts.
