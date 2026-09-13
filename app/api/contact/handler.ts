import { contact, contactCopy, contactMail } from "@/content/site";

/**
 * The route the contact form posts to (ADR-0004): the site's one piece of
 * server code, and the only place a visitor's words go anywhere but the
 * screen.
 *
 * `handleContact` is the whole route, and it is a function of a `Request`
 * and its dependencies: the two things that touch the network, the token
 * verifier and the mail sender, are handed in, and so is the rate limiter,
 * which holds state, and the secrets, which are the environment's. The
 * default export binds the real ones at this module's edge, and the route
 * file exports that as `POST`. So a test calls the handler with fakes and
 * a `Request` and reads the `Response`, and nothing in it reaches the
 * network.
 */

/**
 * The name Turnstile posts its token under. The widget writes it into the
 * form on its own, and the route reads it by the same name.
 */
export const TURNSTILE_TOKEN_FIELD = "cf-turnstile-response";

/**
 * How long each field may be, in characters. A name and an address have
 * their ordinary lengths; a message shorter than a sentence is not one a
 * person wrote, and one longer than a page is not one a Recruiter wrote.
 */
export const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  message: { min: 20, max: 3000 },
} as const;

/** The three fields a visitor fills, trimmed. */
export type Message = {
  name: string;
  email: string;
  message: string;
};

/** The mail the sender is handed: what Shahmeer's inbox receives. */
export type Mail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

/** The two secrets, read from the environment at the module's edge. */
export type Secrets = {
  /** `RESEND_API_KEY` */
  resendApiKey: string | undefined;
  /** `TURNSTILE_SECRET_KEY` */
  turnstileSecretKey: string | undefined;
};

/** True when the Turnstile token stands for a human, as Cloudflare sees it. */
export type Verifier = (
  secret: string,
  token: string,
  ip: string,
) => Promise<boolean>;

/** Sends one mail, or throws. */
export type Sender = (apiKey: string, mail: Mail) => Promise<void>;

export type ContactDeps = {
  secrets: Secrets;
  verify: Verifier;
  send: Sender;
  limiter: RateLimiter;
};

/** Allows or refuses one more message from an IP, and remembers the ones it allowed. */
export type RateLimiter = {
  allows(ip: string): boolean;
};

/** Five messages in ten minutes: more than a person writes, fewer than a bot sends. */
const RATE_LIMIT = { messages: 5, windowMs: 10 * 60 * 1000 };

/** IPs remembered before the ones outside the window are swept. */
const RATE_LIMIT_SWEEP_AT = 1000;

/**
 * A best-effort limit, in memory (ADR-0004): it holds for as long as the
 * function instance does, which is enough to stop a script and is not
 * meant to stop more, because Turnstile is the first line and this the
 * second. A message counts once it is allowed, sent or not, so a sender
 * that fails cannot be made to fail more often. The clock is handed in so
 * a test can move it.
 */
export function createRateLimiter({
  now = Date.now,
}: { now?: () => number } = {}): RateLimiter {
  const allowedAt = new Map<string, number[]>();

  const inWindow = (times: number[], at: number): number[] =>
    times.filter((time) => at - time < RATE_LIMIT.windowMs);

  return {
    allows(ip) {
      const at = now();

      if (allowedAt.size >= RATE_LIMIT_SWEEP_AT) {
        for (const [known, times] of allowedAt) {
          if (inWindow(times, at).length === 0) {
            allowedAt.delete(known);
          }
        }
      }

      const recent = inWindow(allowedAt.get(ip) ?? [], at);
      const allowed = recent.length < RATE_LIMIT.messages;

      if (allowed) {
        recent.push(at);
      }
      allowedAt.set(ip, recent);

      return allowed;
    },
  };
}

/** The visitor's address as the platform forwards it, or "unknown" off it. */
function ipOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** The posted fields as strings, and whether a plain form posted them. */
type Body = {
  fields: Record<string, string>;
  /** True for a form-encoded post, which a `<form>` makes with no script. */
  fromForm: boolean;
};

/**
 * The body as the page's script sends it, JSON, or as the form itself sends
 * it, form-encoded; anything else, or a body that will not parse, is
 * nothing this route was posted. A JSON value that is not a string is read
 * as an empty one, so a bot posting a number where a name goes is refused
 * for the missing name and nothing else.
 */
async function readBody(request: Request): Promise<Body | undefined> {
  const type = request.headers.get("content-type") ?? "";
  const fields: Record<string, string> = {};

  try {
    if (type.startsWith("application/json")) {
      const json: unknown = await request.json();

      if (json === null || typeof json !== "object" || Array.isArray(json)) {
        return undefined;
      }
      for (const [key, value] of Object.entries(json)) {
        fields[key] = typeof value === "string" ? value : "";
      }

      return { fields, fromForm: false };
    }

    if (
      type.startsWith("application/x-www-form-urlencoded") ||
      type.startsWith("multipart/form-data")
    ) {
      for (const [key, value] of await request.formData()) {
        fields[key] = typeof value === "string" ? value : "";
      }

      return { fields, fromForm: true };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

/** `&`, `<`, `>` and `"` as HTML entities, so a word is never markup. */
function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * The page a browser with no script lands on after the form posts. Nothing
 * was sent, because Turnstile could not run, and the page says so with the
 * form's own failure line, the address in it a link. No word of the
 * visitor's is on it: the page is the site's, not an echo of the post.
 */
function noScriptPage(): Response {
  const address = escapeHtml(contact.email);
  const line = escapeHtml(contactCopy.form.failure).replace(
    address,
    `<a href="mailto:${address}">${address}</a>`,
  );

  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(contact.name)}</title>
</head>
<body>
<p>${line}</p>
</body>
</html>
`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

/** Something before an at sign, and a dotted host after it. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with a field, for the page to say in its own words. */
export type FieldProblem = "missing" | "too-short" | "too-long" | "not-an-email";

/**
 * The first field that fails its limit, and how, or undefined when all
 * three pass. One at a time: the visitor is sent back to one box.
 */
function problemWith(
  message: Message,
): { field: string; problem: FieldProblem } | undefined {
  const { fields } = contactCopy.form;

  for (const key of ["name", "email", "message"] as const) {
    const value = message[key];
    const limit: { min?: number; max: number } = LIMITS[key];
    const field = fields[key].name;

    if (value.length === 0) {
      return { field, problem: "missing" };
    }
    if (limit.min !== undefined && value.length < limit.min) {
      return { field, problem: "too-short" };
    }
    if (value.length > limit.max) {
      return { field, problem: "too-long" };
    }
    if (key === "email" && !EMAIL_SHAPE.test(value)) {
      return { field, problem: "not-an-email" };
    }
  }

  return undefined;
}

/**
 * A message not sent for a reason that is not the visitor's: the answer
 * names the email address, so a person who wrote one still has a way.
 */
function refused(status: number): Response {
  return Response.json({ ok: false, email: contact.email }, { status });
}

/**
 * The mail as Shahmeer's inbox gets it: from the site's own address, so it
 * is not filed as spam, to his Gmail, with the visitor as Reply-To, so the
 * answer is one click. The visitor's name and address open the text too,
 * so they survive a mail client that hides the Reply-To.
 */
function mailFor(message: Message): Mail {
  return {
    from: contactMail.from,
    to: contact.email,
    replyTo: message.email,
    subject: contactMail.subject,
    text: `From: ${message.name} <${message.email}>\n\n${message.message}`,
  };
}

export async function handleContact(
  request: Request,
  deps: ContactDeps,
): Promise<Response> {
  const body = await readBody(request);
  if (!body) {
    return Response.json({ ok: false, problem: "unreadable" }, { status: 400 });
  }

  const { fields } = body;
  const token = fields[TURNSTILE_TOKEN_FIELD] ?? "";

  if (body.fromForm && token === "") {
    return noScriptPage();
  }

  const { name, email, message } = contactCopy.form.fields;
  const posted: Message = {
    name: (fields[name.name] ?? "").trim(),
    email: (fields[email.name] ?? "").trim(),
    message: (fields[message.name] ?? "").trim(),
  };

  // The honeypot is a box a human never sees, so anything in it was a bot
  // filling every box. It is told it succeeded, so it learns nothing.
  if ((fields[contactCopy.form.honeypot.name] ?? "").trim() !== "") {
    return Response.json({ ok: true });
  }

  const problem = problemWith(posted);
  if (problem) {
    return Response.json({ ok: false, ...problem }, { status: 400 });
  }

  // A preview with no keys answers honestly rather than throwing, or
  // sending with no key for Resend to refuse.
  const { resendApiKey, turnstileSecretKey } = deps.secrets;
  if (!resendApiKey || !turnstileSecretKey) {
    return refused(503);
  }

  const ip = ipOf(request);
  if (!deps.limiter.allows(ip)) {
    return refused(429);
  }

  // A verifier that cannot be reached is not a visitor who failed: the
  // answer is the one a sender that cannot be reached gets.
  let human: boolean;
  try {
    human = await deps.verify(turnstileSecretKey, token, ip);
  } catch (error) {
    console.error("contact: the token could not be verified", error);
    return refused(502);
  }
  if (!human) {
    return refused(403);
  }

  // The message itself is never logged: a visitor's words go to Shahmeer
  // and nowhere else, and a failure is a failure of the sender, not of
  // what was written.
  try {
    await deps.send(resendApiKey, mailFor(posted));
  } catch (error) {
    console.error("contact: the message could not be sent", error);
    return refused(502);
  }

  return Response.json({ ok: true });
}

/**
 * The real sender: Resend's one HTTP call, made with `fetch` rather than
 * the SDK, because one POST does not earn a dependency. `reply_to` is the
 * visitor, so Shahmeer's answer is one click.
 */
async function sendWithResend(apiKey: string, mail: Mail): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: mail.from,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend answered ${response.status}`);
  }
}

/**
 * The verifier, until Turnstile is wired: every token passes. The widget is
 * not on the form yet, so there is no token to check; the real verifier,
 * which posts the token, the secret and the IP to Cloudflare, replaces
 * this when the widget arrives, and nothing else in the route changes.
 */
async function passEveryToken(): Promise<boolean> {
  return true;
}

/** One limiter for the life of this instance: the memory the limit is in. */
const limiter = createRateLimiter();

/** The route as it runs: the handler with the real world bound to it. */
export default function POST(request: Request): Promise<Response> {
  return handleContact(request, {
    secrets: {
      resendApiKey: process.env.RESEND_API_KEY,
      turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    },
    verify: passEveryToken,
    send: sendWithResend,
    limiter,
  });
}
