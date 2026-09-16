import { afterEach, describe, expect, it, vi } from "vitest";

import POST, {
  createRateLimiter,
  handleContact,
  TURNSTILE_TOKEN_FIELD,
  type ContactDeps,
  type Mail,
} from "@/app/api/contact/handler";
import { contact, contactCopy } from "@/content/site";

/**
 * The contact route as a browser or a script reaches it: a `Request` in, a
 * `Response` out, with the two things that touch the network, the Token
 * verifier and the Mail sender, handed in as fakes. Nothing here reads the
 * handler's insides; a Message is "sent" when the fake sender was handed
 * it, and refused when it was not.
 */

const ROUTE = `http://localhost${contactCopy.form.action}`;
const { name, email, message } = contactCopy.form.fields;
const honeypot = contactCopy.form.honeypot.name;

/**
 * A Message a Recruiter would send, posted under the Form's field names,
 * with the Token the widget wrote into the Form beside them.
 */
const goodMessage = {
  [name.name]: "Jane Recruiter",
  [email.name]: "jane@example.com",
  [message.name]: "We have a Salesforce role open and your portal work looks like a fit.",
  [TURNSTILE_TOKEN_FIELD]: "a-token",
};

const IP = "203.0.113.1";

/** The post the Form's script makes: JSON, from one visitor's address. */
function jsonPost(fields: Record<string, unknown>, ip = IP): Request {
  return new Request(ROUTE, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(fields),
  });
}

/** The post a plain `<form method="post">` makes, with or without a Token. */
function formPost(fields: Record<string, string>, ip = IP): Request {
  return new Request(ROUTE, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-forwarded-for": ip,
    },
    body: new URLSearchParams(fields),
  });
}

/** The handler's dependencies as fakes, and every Mail the sender was handed. */
type Fakes = { deps: ContactDeps; sent: Mail[] };

/**
 * Both keys set, a verifier that passes, a sender that remembers, and a
 * fresh limiter on the real clock; a test overrides the one it is about.
 */
function fakes(overrides: Partial<ContactDeps> = {}): Fakes {
  const sent: Mail[] = [];

  return {
    sent,
    deps: {
      secrets: { resendApiKey: "re_test", turnstileSecretKey: "ts_test" },
      verify: async () => true,
      send: async (_apiKey, mail) => {
        sent.push(mail);
      },
      limiter: createRateLimiter(),
      ...overrides,
    },
  };
}

describe("The contact route", () => {
  it("sends a good message once, from the site's domain to Shahmeer, with the visitor as Reply-To", async () => {
    const { deps, sent } = fakes();

    const response = await handleContact(jsonPost(goodMessage), deps);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].from).toMatch(/@shahmeerasim\.me>?$/);
    expect(sent[0].to).toBe(contact.email);
    expect(sent[0].replyTo).toBe("jane@example.com");
    expect(sent[0].text).toContain(goodMessage[message.name]);
  });

  /**
   * The limits are the spec's: a name of at most 100 characters, an email
   * of at most 254 that has the shape of one, and a Message box of 20 to 3000.
   * The refusal names the field, so the Form can point at the box.
   */
  it.each([
    ["a missing name", { [name.name]: "" }, name.name],
    ["a name over 100 characters", { [name.name]: "x".repeat(101) }, name.name],
    ["a missing email", { [email.name]: "" }, email.name],
    ["an email with no at sign", { [email.name]: "jane.example.com" }, email.name],
    [
      "an email over 254 characters",
      { [email.name]: `${"x".repeat(250)}@x.io` },
      email.name,
    ],
    ["a missing message", { [message.name]: "" }, message.name],
    ["a message under 20 characters", { [message.name]: "Hi there, hello" }, message.name],
    ["a message over 3000 characters", { [message.name]: "x".repeat(3001) }, message.name],
    ["a field left out", { [message.name]: undefined }, message.name],
  ])("refuses %s, naming the field, and sends nothing", async (_case, bad, field) => {
    const { deps, sent } = fakes();

    const response = await handleContact(jsonPost({ ...goodMessage, ...bad }), deps);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ ok: false, field });
    expect(sent).toEqual([]);
  });

  it("takes a name of 100, an email of 254 and a message of 20 and of 3000", async () => {
    for (const edge of [
      { [name.name]: "x".repeat(100) },
      { [email.name]: `${"x".repeat(249)}@x.io` },
      { [message.name]: "x".repeat(20) },
      { [message.name]: "x".repeat(3000) },
    ]) {
      const { deps, sent } = fakes();

      const response = await handleContact(jsonPost({ ...goodMessage, ...edge }), deps);

      expect(response.status).toBe(200);
      expect(sent).toHaveLength(1);
    }
  });

  /** Not JSON, not a form post: nothing this route was posted, and no field to name. */
  it("refuses a body it cannot read, naming the email and no field", async () => {
    const { deps, sent } = fakes();

    const response = await handleContact(
      new Request(ROUTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
      deps,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, email: contact.email });
    expect(sent).toEqual([]);
  });

  /** A bot that filled every box is told it succeeded, so it learns nothing. */
  it("answers a filled honeypot as a success and sends nothing", async () => {
    const { deps, sent } = fakes();

    const response = await handleContact(
      jsonPost({ ...goodMessage, [honeypot]: "https://example.com" }),
      deps,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sent).toEqual([]);
  });

  /**
   * Five Messages in ten minutes is more than a person writes; the sixth is
   * refused and names the email address, so a person who did write six has
   * a way left. The limit is by IP, so one busy visitor holds up nobody
   * else, and the clock is the test's, so the ten minutes need not pass.
   */
  it("refuses a sixth message from one IP inside ten minutes, and takes one after", async () => {
    let clock = 1_000_000;
    const { deps, sent } = fakes({ limiter: createRateLimiter({ now: () => clock }) });

    for (let i = 0; i < 5; i++) {
      expect((await handleContact(jsonPost(goodMessage), deps)).status).toBe(200);
    }
    const sixth = await handleContact(jsonPost(goodMessage), deps);
    expect(sixth.status).toBe(429);
    await expect(sixth.json()).resolves.toMatchObject({ ok: false, email: contact.email });
    expect(sent).toHaveLength(5);

    expect((await handleContact(jsonPost(goodMessage, "203.0.113.2"), deps)).status).toBe(200);

    clock += 10 * 60 * 1000;
    expect((await handleContact(jsonPost(goodMessage), deps)).status).toBe(200);
    expect(sent).toHaveLength(7);
  });

  it("takes a form-encoded post with a token the same as a JSON one", async () => {
    const { deps, sent } = fakes();

    const response = await handleContact(formPost(goodMessage), deps);

    expect(response.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].replyTo).toBe("jane@example.com");
  });

  /**
   * With JavaScript off the Form still posts, but Turnstile never ran, so
   * there is no Token and nothing can be sent. The visitor is not left on
   * a dead button: the answer is a page, since a page is what a browser
   * shows, and it names the email address.
   */
  it("answers a form-encoded post with no token with an HTML page naming the email", async () => {
    const { deps, sent } = fakes();

    const response = await handleContact(
      formPost({ ...goodMessage, [TURNSTILE_TOKEN_FIELD]: "" }),
      deps,
    );

    expect(response.headers.get("content-type")).toMatch(/^text\/html/);
    const html = await response.text();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain(contact.email);
    expect(html).not.toContain(goodMessage[message.name]);
    expect(sent).toEqual([]);
  });

  /** The failure is logged, so it can be seen; the Message is not, so it cannot. */
  it("answers 502 naming the email when the sender throws, logging no word of the message", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps } = fakes({
      send: async () => {
        throw new Error("Resend answered 500");
      },
    });

    const response = await handleContact(jsonPost(goodMessage), deps);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ ok: false, email: contact.email });
    expect(logged).toHaveBeenCalled();
    for (const value of Object.values(goodMessage)) {
      expect(JSON.stringify(logged.mock.calls)).not.toContain(value);
    }
    logged.mockRestore();
  });

  /**
   * A preview with no keys, or a key that was rotated and not set, must
   * answer honestly rather than throw; and it must not try to send with
   * no key and let Resend refuse it.
   */
  it.each([
    ["RESEND_API_KEY", { resendApiKey: undefined, turnstileSecretKey: "ts_test" }],
    ["TURNSTILE_SECRET_KEY", { resendApiKey: "re_test", turnstileSecretKey: undefined }],
  ])("answers naming the email, never calling the sender, without %s", async (_key, secrets) => {
    const { deps, sent } = fakes({ secrets });

    const response = await handleContact(jsonPost(goodMessage), deps);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ ok: false, email: contact.email });
    expect(sent).toEqual([]);
  });

  it("refuses a token the verifier fails, naming the email, and sends nothing", async () => {
    const { deps, sent } = fakes({ verify: async () => false });

    const response = await handleContact(jsonPost(goodMessage), deps);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, email: contact.email });
    expect(sent).toEqual([]);
  });

  /**
   * The Form's script only posts once the widget has produced a Token, so
   * a JSON post with none is a script's, not a person's. It is refused
   * without the verifier being asked, naming the email address as every
   * refusal does.
   */
  it("refuses a JSON post with no token, asking the verifier nothing, and sends nothing", async () => {
    const asked = vi.fn(async () => true);
    const { deps, sent } = fakes({ verify: asked });

    const response = await handleContact(
      jsonPost({ ...goodMessage, [TURNSTILE_TOKEN_FIELD]: undefined }),
      deps,
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, email: contact.email });
    expect(asked).not.toHaveBeenCalled();
    expect(sent).toEqual([]);
  });

  it("hands the verifier the secret, the token and the visitor's IP", async () => {
    const seen: unknown[] = [];
    const { deps } = fakes({
      verify: async (...args) => {
        seen.push(args);
        return true;
      },
    });

    await handleContact(jsonPost(goodMessage), deps);

    expect(seen).toEqual([["ts_test", "a-token", IP]]);
  });

  it("hands the sender the Resend key", async () => {
    const keys: string[] = [];
    const { deps } = fakes({
      send: async (apiKey) => {
        keys.push(apiKey);
      },
    });

    await handleContact(jsonPost(goodMessage), deps);

    expect(keys).toEqual(["re_test"]);
  });
});

/**
 * The route as it runs, with the real verifier and sender bound to it and
 * the network faked: `fetch` answers as Cloudflare and Resend would, and
 * what is read is what each was posted. Nothing here reads the verifier's
 * insides; the Token passed when Cloudflare said so, and the Mail went out
 * after it and not before.
 */
describe("The contact route as it runs", () => {
  const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const RESEND = "https://api.resend.com/emails";

  /** Fakes the network: remembers every call, and answers siteverify as told. */
  function network(siteverify: { success: boolean }): Request[] {
    const calls: Request[] = [];

    vi.stubGlobal("fetch", async (input: string | URL | Request, init?: RequestInit) => {
      const request = new Request(input, init);
      calls.push(request);

      return Response.json(request.url === SITEVERIFY ? siteverify : { id: "email_1" });
    });

    return calls;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts the secret, the token and the visitor's IP to siteverify, and sends once it passes", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_live");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "ts_live");
    const calls = network({ success: true });

    const response = await POST(jsonPost(goodMessage, "203.0.113.9"));

    expect(response.status).toBe(200);
    expect(calls.map((call) => call.url)).toEqual([SITEVERIFY, RESEND]);

    const [verify, send] = calls;
    expect(verify.method).toBe("POST");
    expect(Object.fromEntries(await verify.formData())).toEqual({
      secret: "ts_live",
      response: "a-token",
      remoteip: "203.0.113.9",
    });
    expect(send.headers.get("authorization")).toBe("Bearer re_live");
  });

  it("refuses a token Cloudflare fails, and sends nothing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_live");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "ts_live");
    const calls = network({ success: false });

    const response = await POST(jsonPost(goodMessage, "203.0.113.10"));

    expect(response.status).toBe(403);
    expect(calls.map((call) => call.url)).toEqual([SITEVERIFY]);
  });
});
