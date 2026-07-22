# Internal AI Users

Kairo can give internal developers and testers unlimited AI usage while keeping normal limits for regular users.

## Environment Variable

Use `INTERNAL_USER_EMAILS` to define the allowlist:

```env
INTERNAL_USER_EMAILS=correo1@gmail.com,correo2@gmail.com
```

Rules:

- Separate emails with commas.
- Emails are compared case-insensitively.
- Spaces around emails are ignored.
- Do not commit real secrets or private production-only values to the repo.

## Vercel Setup

1. Open the Kairo project in Vercel.
2. Go to **Settings** -> **Environment Variables**.
3. Add `INTERNAL_USER_EMAILS`.
4. Paste the comma-separated list of internal developer/tester emails.
5. Save it for the environments where you need it, usually **Production** and **Preview**.
6. Redeploy so the new environment variable is available to the API routes.

## What It Does

If the authenticated Supabase user's email is included in `INTERNAL_USER_EMAILS`, the server skips the normal AI usage limits for:

- Chat with Kairo.
- Image-based exercise corrections.
- Simulacro corrections.
- Study plan generation.

Normal users are not affected and keep the existing limits.

## Security Notes

- The check runs only on the server.
- The client cannot mark itself as internal.
- The allowlist is read from `process.env.INTERNAL_USER_EMAILS`.
- The list is not exposed to the frontend.
