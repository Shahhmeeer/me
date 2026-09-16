"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ACCENT_LINK,
  FOCUS_RING,
  PRIMARY_ACTION,
  TEXT_FIELD,
} from "@/components/interactive";
import { sendMessage, type Outcome } from "@/components/send-message";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";
import type { ContactFormCopy, FormField } from "@/content/site";

type ContactFormProps = {
  form: ContactFormCopy;
  /** The address the failure line names, made a link there. */
  email: string;
  /**
   * The Turnstile site key, public, from the environment. Without one the
   * widget is not drawn and Send is never blocked for a Token, so a preview
   * with no keys is a Form that posts and a route that answers honestly.
   */
  siteKey?: string;
};

/** The element id a field's label is bound to. Prefixed, so it is the page's once. */
function idOf(field: Pick<FormField, "name">): string {
  return `contact-${field.name}`;
}

/** The element id of the box the Turnstile widget is drawn in, prefixed as a field's is. */
export const TURNSTILE_BOX_ID = idOf({ name: "turnstile" });

/**
 * True once the page's script is running, false in the HTML the server
 * writes. Nothing changes under it, so there is nothing to subscribe to.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** The element id of the word said beside a refused field's box. */
function problemIdOf(field: Pick<FormField, "name">): string {
  return `${idOf(field)}-problem`;
}

/**
 * Where the Form is: waiting to be filled, or filled and refused for one
 * box; on its way; sent; or not sent for a reason that is not the
 * visitor's. A refused box is `idle` with a problem beside it, because the
 * visitor is back to typing.
 */
type State =
  | { status: "idle"; problem?: Extract<Outcome, { kind: "problem" }> }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "failed" };

type FieldProps = {
  field: FormField;
  /** The word said beside the box, when the route refused it. */
  problem?: string;
  /** The box itself, an input or a textarea, carrying the field's id and name. */
  children: ReactNode;
};

/**
 * One field a visitor sees: its label over its box, bound to it by id, and
 * under it, only once the route has refused it, the word for what is wrong.
 * The word is a plain caption, because coral is the one filled button and
 * nothing else on this page; the box says it is invalid by the attribute,
 * which is what a screen reader reads.
 */
function Field({ field, problem, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={idOf(field)} className="text-caption font-medium text-foreground">
        {field.label}
      </label>
      {children}
      {problem !== undefined && (
        <p id={problemIdOf(field)} className="text-caption text-foreground">
          {problem}
        </p>
      )}
    </div>
  );
}

/**
 * The failure line with the address in it a link, so a visitor whose
 * Message did not send is one tap from the other way to write, as they are
 * on the page the route answers a scriptless post with.
 */
function FailureLine({ line, email }: { line: string; email: string }) {
  const at = line.indexOf(email);
  if (at === -1) {
    return line;
  }

  return (
    <>
      {line.slice(0, at)}
      <a href={`mailto:${email}`} className={ACCENT_LINK}>
        {email}
      </a>
      {line.slice(at + email.length)}
    </>
  );
}

/**
 * The Form: the card on the Contact Spread (ADR-0004), the second
 * way to write to Shahmeer, beside the address that is the first.
 *
 * A plain `<form method="post">` to the route's path, so it posts before
 * any script runs and with none, and the route answers that post with a
 * page naming the address. This is the site's third client component, after
 * the reveal and the Strip and before the Turnstile widget it holds, and
 * what it adds is sending from the page: on
 * submit it posts the same fields as JSON with `fetch`, through
 * `components/send-message.ts`, disables the button and relabels it
 * "Sending…" so the click is seen to have landed, and then does one of three
 * things with the answer. A sent Message swaps the fields for the success
 * line, and the button with them, so nothing invites a second send. A
 * refused field gets its word said under its box, the box marked invalid
 * and given focus, and the button back, so the visitor fixes the one thing
 * and sends again. Anything else is the failure line, the address in it a
 * link, said under the fields with everything typed still in them, so
 * nothing is lost and the visitor can send again or copy their words into
 * their own mail; the button comes back for the first of those.
 *
 * The success and failure lines are spoken into one paragraph that is on
 * the page from the first paint, empty, and `aria-live="polite"`: a screen
 * reader announces a live region's new words only if the region was there
 * before them. Focus moves to the line as well, so a visitor who tabbed to
 * Send and pressed Enter is taken to the answer rather than left on a
 * button that is gone or a form that looks the same.
 *
 * Three fields, each with a visible `<label>` bound to it, so a screen
 * reader names the box and a click on the word lands in it; the email typed
 * `email`, so a phone offers the keyboard with an at sign; all three
 * required, so an empty post never leaves the browser, script or no
 * script; each told what a browser may fill it with, so a visitor's own
 * name and address are one tap. Every word is the content module's.
 *
 * The fourth field is the Honeypot: a box a human never meets, hidden
 * from sight by the same rule a screen-reader-only label is, and from the
 * accessibility tree by `aria-hidden`, out of the Tab order, and refused
 * autofill, so the only thing that fills it is a bot filling every box.
 * It is posted with the rest, empty, and the route drops a Message that
 * arrives with it filled. It is named the way a bot expects a field to be
 * named, which is the content module's choice, and the route reads it by
 * the same name.
 *
 * The fifth is the Token, and it is the widget's: `components/turnstile.tsx`
 * draws Cloudflare's widget in a box above Send when there is a site key,
 * and the widget writes the Token into a hidden input of its own, which
 * the post carries with the rest. Until the widget has produced one, Send
 * is disabled, so nothing is posted that the route would refuse; and after
 * a post that did not send, the widget is reset for a fresh one, because a
 * Token is good for one post. Only the script blocks Send: the HTML the
 * server writes has it enabled, key or no key, because a browser with no
 * script never has a Token and must still be able to post, so the route
 * can answer it with the page naming the address. Without a site key no
 * widget is drawn and Send is never blocked, and the route, with no secret
 * to check a Token against, answers that post naming the address too.
 *
 * The card is `relative` so the hidden box is placed against the card and
 * not against the Panel; and the card's teal hover border is its focus
 * border too, by the `.card:focus-within` rule, so a visitor typing sees
 * the whole card lit and not only the box.
 */
export function ContactForm({ form, email, siteKey }: ContactFormProps) {
  const { name, email: emailField, message } = form.fields;
  const [state, setState] = useState<State>({ status: "idle" });
  const [token, setToken] = useState<string | undefined>(undefined);
  const formElement = useRef<HTMLFormElement>(null);
  const statusLine = useRef<HTMLParagraphElement>(null);
  const widget = useRef<TurnstileHandle>(null);
  const hydrated = useHydrated();

  const problem = state.status === "idle" ? state.problem : undefined;
  const sending = state.status === "sending";
  const sent = state.status === "sent";
  // Blocked by the script only, never by the HTML: see above.
  const awaitingToken = siteKey !== undefined && hydrated && token === undefined;

  // The answer is read aloud by the live region and landed on by focus:
  // both, because a visitor who pressed Enter on the button is otherwise
  // left on a button that is gone.
  useEffect(() => {
    if (state.status === "sent" || state.status === "failed") {
      statusLine.current?.focus();
    }
  }, [state.status]);

  // A refused box is where the visitor goes next.
  useEffect(() => {
    if (problem === undefined) {
      return;
    }
    const box = formElement.current?.elements.namedItem(problem.field);
    if (box instanceof HTMLElement) {
      box.focus();
    }
  }, [problem]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    // Every field as the plain post would carry it, the Honeypot and the
    // Token included; a file where a string goes is nothing this Form posts.
    const fields = Object.fromEntries(
      [...new FormData(event.currentTarget)].map(([key, value]) => [
        key,
        typeof value === "string" ? value : "",
      ]),
    );

    setState({ status: "sending" });
    // `fetch` is called through a closure rather than handed over bare: a
    // browser's `fetch` refuses to run with `this` unbound.
    const outcome = await sendMessage(form, fields, (input, init) =>
      fetch(input, init),
    );

    if (outcome.kind === "sent") {
      setState({ status: "sent" });
      return;
    }

    // The Token went with the post, sent or not: the next post needs its own.
    widget.current?.reset();
    if (outcome.kind === "problem") {
      setState({ status: "idle", problem: outcome });
    } else {
      setState({ status: "failed" });
    }
  }

  /** The word said beside a box the route refused, or nothing beside every other. */
  function wordBeside(field: FormField): string | undefined {
    return problem?.field === field.name ? form.problems[problem.problem] : undefined;
  }

  /** What a refused box says about itself: that it is invalid, and where the word is. */
  function saidBy(field: FormField) {
    return wordBeside(field) === undefined
      ? {}
      : { "aria-invalid": true, "aria-describedby": problemIdOf(field) };
  }

  return (
    <form
      ref={formElement}
      method="post"
      action={form.action}
      onSubmit={onSubmit}
      aria-busy={sending || undefined}
      className="card relative flex flex-col gap-gutter p-gutter"
    >
      {!sent && (
        <>
          <Field field={name} problem={wordBeside(name)}>
            <input
              id={idOf(name)}
              name={name.name}
              type="text"
              required
              autoComplete="name"
              placeholder={name.placeholder}
              className={TEXT_FIELD}
              {...saidBy(name)}
            />
          </Field>

          <Field field={emailField} problem={wordBeside(emailField)}>
            <input
              id={idOf(emailField)}
              name={emailField.name}
              type="email"
              required
              autoComplete="email"
              placeholder={emailField.placeholder}
              className={TEXT_FIELD}
              {...saidBy(emailField)}
            />
          </Field>

          <Field field={message} problem={wordBeside(message)}>
            <textarea
              id={idOf(message)}
              name={message.name}
              required
              rows={5}
              placeholder={message.placeholder}
              className={`${TEXT_FIELD} resize-y`}
              {...saidBy(message)}
            />
          </Field>

          <div aria-hidden="true" className="sr-only">
            <label htmlFor={idOf(form.honeypot)}>{form.honeypot.label}</label>
            <input
              id={idOf(form.honeypot)}
              name={form.honeypot.name}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {siteKey !== undefined && (
            <Turnstile
              ref={widget}
              id={TURNSTILE_BOX_ID}
              siteKey={siteKey}
              onToken={setToken}
            />
          )}

          <button
            type="submit"
            disabled={sending || awaitingToken}
            className={`${PRIMARY_ACTION} self-start`}
          >
            {sending ? form.sending : form.submit}
          </button>
        </>
      )}

      {/*
       * While it has nothing to say it is hidden the way a screen-reader-only
       * label is, out of sight and out of the card's spacing, but never out
       * of the accessibility tree: `display: none` would take it out, and a
       * live region that was not there before its words are is not read.
       */}
      <p
        ref={statusLine}
        tabIndex={-1}
        aria-live="polite"
        className={`${FOCUS_RING} rounded-xs text-body empty:sr-only`}
      >
        {sent && form.success}
        {state.status === "failed" && <FailureLine line={form.failure} email={email} />}
      </p>
    </form>
  );
}
