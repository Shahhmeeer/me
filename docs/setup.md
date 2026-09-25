# Setup

What the site needs from outside the repo. It is all set already; this is for
rotating a key, rebuilding the Vercel project, or cloning on a new machine.

## The forbidden-name list

The repo is public, so the end-client names the site must never publish are
never committed (ADR-0001). Every build checks the site's text against them,
and fails without the list rather than passing.

- **GitHub**: Settings → Secrets and variables → Actions → repository secret
  `FORBIDDEN_END_CLIENT_NAMES`, the names separated by commas or newlines.
- **Vercel**: the same variable in Project Settings → Environment Variables,
  for Production, Preview and Development, marked Sensitive. Vercel reads it at
  build time, so redeploy after changing it.
- **Locally**: copy `.forbidden-end-client-names.example` to
  `.forbidden-end-client-names`, which git ignores.

## The contact form's keys

The Form sends through Resend behind a Cloudflare Turnstile check (ADR-0004).
It needs three variables, set in Vercel and in `.env.local`, never committed:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: the widget's public key.
- `TURNSTILE_SECRET_KEY`: what the route verifies a Token with.
- `RESEND_API_KEY`: a sending key scoped to `shahmeerasim.me`.

`bash docs/agents/keys-wizard.sh` creates, sets and checks all three, and is
safe to run again after rotating one. Without them the Form answers with the
email address and sends nothing.

## Checking the live site

```bash
curl -sI https://www.shahmeerasim.me | head -1           # 200
curl -sI https://shahmeerasim.me | grep -i location      # → https://www.shahmeerasim.me/
curl -sI https://www.shahmeerasim.me/M_Shahmeer_Khan_Salesforce_Developer_CV.pdf | grep -iE "^HTTP|content-type"
```
