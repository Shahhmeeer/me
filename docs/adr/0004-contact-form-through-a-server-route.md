# The contact form sends through a server route, Resend and Turnstile

The Contact Panel carries a form, Name, Email and Message, beside the email
address, because a Recruiter on a locked-down work laptop often has no mail
client behind a `mailto:` link and a form is the one way to reach Shahmeer
that always works. The message is posted to a Next.js Route Handler in this
repo, which verifies a Cloudflare Turnstile token, drops anything that filled
the honeypot field or overran the length limits, and sends the message with
Resend from `shahmeerasim.me` to Shahmeer's Gmail, with the visitor's address
as Reply-To so the answer is one click.

This is the site's first server code and its first secrets, on a site that
was until now static and had two scripts. The alternatives were a hosted form
service, which puts a third party's markup and branding on the Panel and
Shahmeer's inbox behind someone else's account, and no form at all. Resend is
already the sender for Shahmeer's agency site; Turnstile is free, invisible to
a human, and does not need the site to be hosted on Cloudflare. The keys are
scoped to this domain only and live in Vercel's environment, never in the
repo. The route rate-limits by IP as best a stateless function can, which is
a second line behind Turnstile and not the first, so no key-value store is
added for it.

The form degrades: with JavaScript off it still posts, and the route answers
politely with the email address, because Turnstile cannot run. With a network
error the Panel names the address too. The address is always on the Panel,
larger than the form; the form is the second way, not the only one.
