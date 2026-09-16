import { describe, expect, it } from "vitest";

import { sendMessage, type Fetch } from "@/components/send-message";
import { contactCopy } from "@/content/site";

/**
 * The Form's script sending a Message: the fields in, one call to the route
 * out, and the route's answer read back as what the Form should do next.
 * The route is a fake `fetch`, so nothing here reaches the network, and
 * nothing here reads the script's insides: a Message is sent when the fake
 * was posted it, and the outcome is what the fake answered.
 */

const { form } = contactCopy;
const { action } = form;

const fields = {
  name: "Jane Recruiter",
  email: "jane@example.com",
  message: "We have a Salesforce role open and your portal work looks like a fit.",
  website: "",
};

/**
 * A route that answers every post with this body and status, and remembers
 * the post. The path is resolved against a page the way a browser resolves
 * it, since a `Request` on its own takes no relative path.
 */
function route(
  body: unknown,
  status = 200,
): { fetch: Fetch; posted: Request[] } {
  const posted: Request[] = [];

  return {
    posted,
    fetch: async (input, init) => {
      posted.push(new Request(new URL(input, "http://localhost"), init));
      return typeof body === "string"
        ? new Response(body, { status, headers: { "content-type": "text/html" } })
        : Response.json(body, { status });
    },
  };
}

describe("sendMessage", () => {
  it("posts the fields to the Form's path as JSON, asking for JSON back", async () => {
    const { fetch, posted } = route({ ok: true });

    await sendMessage(form, fields, fetch);

    expect(posted).toHaveLength(1);
    const [request] = posted;
    expect(new URL(request.url).pathname).toBe(action);
    expect(request.method).toBe("POST");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(request.headers.get("accept")).toBe("application/json");
    expect(await request.json()).toEqual(fields);
  });

  it("reads a sent Message as sent", async () => {
    expect(await sendMessage(form, fields, route({ ok: true }).fetch)).toEqual({
      outcome: "sent",
    });
  });

  /** A refused field is named, so the Form can point at its box. */
  it("reads a refused field as that field's problem", async () => {
    const refused = route({ ok: false, field: "message", problem: "too-short" }, 400);

    expect(await sendMessage(form, fields, refused.fetch)).toEqual({
      outcome: "problem",
      field: "message",
      problem: "too-short",
    });
  });

  /** Too many, not human, no keys, could not send: none is the visitor's to fix. */
  it.each([403, 429, 502, 503])("reads a %i as failed", async (status) => {
    const refused = route({ ok: false, email: "someone@example.com" }, status);

    expect(await sendMessage(form, fields, refused.fetch)).toEqual({
      outcome: "failed",
    });
  });

  it("reads a route that cannot be reached as failed", async () => {
    const down: Fetch = async () => {
      throw new TypeError("Failed to fetch");
    };

    expect(await sendMessage(form, fields, down)).toEqual({ outcome: "failed" });
  });

  /** A page where JSON should be, a proxy's or a platform's, is not a sent Message. */
  it("reads an answer that is not the route's as failed", async () => {
    expect(await sendMessage(form, fields, route("<!doctype html>", 200).fetch)).toEqual({
      outcome: "failed",
    });
    expect(await sendMessage(form, fields, route({ ok: true }, 500).fetch)).toEqual({
      outcome: "failed",
    });
  });

  /** A problem the Form has no word for is a failure, not a blank line beside a box. */
  it("reads a problem it has no word for as failed", async () => {
    const odd = route({ ok: false, field: "message", problem: "cursed" }, 400);
    const noField = route({ ok: false, problem: "too-short" }, 400);

    expect(await sendMessage(form, fields, odd.fetch)).toEqual({ outcome: "failed" });
    expect(await sendMessage(form, fields, noField.fetch)).toEqual({ outcome: "failed" });
  });
});
