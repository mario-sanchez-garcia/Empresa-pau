# Email confirmation setup

Follow these steps once to enable confirmed-email registration.

---

## 1. Resend account + domain

1. Go to resend.com → create account.
2. Add your domain (kairo-pau.com): Resend → Domains → Add Domain.
3. Add the DNS records Resend shows you (MX, SPF, DKIM). Wait until status turns green.
4. Create an API key: Resend → API Keys → Create API Key (Sending access is enough). Copy it.

---

## 2. Supabase SMTP config

Dashboard → Project → Authentication → Email Settings:

| Setting | Value |
|---|---|
| Enable Custom SMTP | On |
| Host | smtp.resend.com |
| Port | 465 |
| Username | resend |
| Password | `<your Resend API key>` |
| Sender name | Kairo |
| Sender email | noreply@kairo-pau.com (must be verified in Resend) |

Save.

---

## 3. Supabase email template

Dashboard → Authentication → Email Templates → Confirm signup:

Paste the HTML from `app/lib/email/confirmationTemplate.ts` (call `confirmationEmailHtml('{{ .ConfirmationURL }}')`), or use the raw HTML and replace the CTA href with `{{ .ConfirmationURL }}`.

Subject line: `Confirma tu cuenta en Kairo`

Save.

---

## 4. Supabase redirect URL

Dashboard → Authentication → URL Configuration:

- Site URL: `https://kairo-pau.com`
- Add to Redirect URLs: `https://kairo-pau.com/auth/callback`

The confirmation link Supabase generates will land on `/auth/callback`, which already exists and handles the token exchange.

---

## 5. Disable email confirmation in Supabase settings

Dashboard → Authentication → Email → **uncheck** "Enable email confirmations".

Wait — this sounds backwards. The reason: our code now calls `signUp()` from the server, and Supabase respects the SMTP config to send the email. The "Enable email confirmations" toggle in the Auth dashboard controls whether Supabase *blocks* sign-in until confirmed. You want users to be blocked until confirmed, so **leave it checked** (enabled).

Summary: Enable email confirmations = ON, custom SMTP filled in → Supabase sends the email via Resend and blocks login until the user clicks the link.

---

## 6. Environment variable

In Vercel → Settings → Environment Variables, add:

```
EMAIL_CONFIRMATION_ENABLED=true
```

Redeploy. From this point on:
- New signups → `{ needsConfirmation: true }` → redirected to `/confirmar-email`
- They click the Resend email → Supabase redirects to `/auth/callback` → they land in the app
- "Resend" button on `/confirmar-email` → calls `/api/auth/resend-confirmation` → 1-per-minute rate limit

---

## Rollback

Set `EMAIL_CONFIRMATION_ENABLED=false` (or delete the var) and redeploy. Registration immediately goes back to the instant-session flow. No data migration needed.
