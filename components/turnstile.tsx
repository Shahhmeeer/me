"use client";

import Script from "next/script";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";

/**
 * The Turnstile widget (ADR-0004): Cloudflare's proof that a person and not
 * a script is filling the Form, drawn inside the Form's card.
 *
 * This is the site's fourth client component, after the reveal, the Strip
 * and the Form, and the one third-party script the page loads besides
 * Analytics. The script is loaded here, by `next/script`, so it is fetched
 * only where the widget is and only when there is a site key to render it
 * with: a preview with no key never asks Cloudflare for anything. It is
 * told not to look for widgets on its own; this component renders the one,
 * into its own box, once the script says it is ready.
 *
 * The widget writes the Token it produces into a hidden input inside its
 * box, named `cf-turnstile-response`, which is the name the route reads it
 * by (`TURNSTILE_TOKEN_FIELD` in the handler). So the Token travels with
 * the fields on its own, in a plain post and in the script's alike; what
 * this component reports to the Form through `onToken` is only whether
 * there is one to post yet. A Token is good for one post, so the Form asks
 * for a fresh one through the handle after a post that did not send; and
 * one that expires, or a widget that errs, is reported as none, so Send
 * is blocked again until Cloudflare issues another.
 *
 * Managed mode, in which Cloudflare decides whether a visitor sees a
 * checkbox, is the widget's setting in the Cloudflare dashboard, not this
 * component's. What is set here is the look: dark, as everything on the
 * page is (ADR-0002), and as wide as its box.
 */

/**
 * Cloudflare's script, told to render nothing on its own: this component
 * renders the one widget, and knows when to, because the script says it
 * is ready.
 */
const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** The part of Cloudflare's API this component uses. */
type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "dark";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** What the Form can ask of the widget: a fresh Token, the old one spent. */
export type TurnstileHandle = {
  reset(): void;
};

type TurnstileProps = {
  /** The element id of the widget's box. */
  id: string;
  /** The public site key, from the environment. */
  siteKey: string;
  /**
   * Told the Token once the widget has one, and `undefined` once it has
   * none again: expired, errored, or reset.
   */
  onToken: (token: string | undefined) => void;
  ref?: Ref<TurnstileHandle>;
};

export function Turnstile({ id, siteKey, onToken, ref }: TurnstileProps) {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [api, setApi] = useState<TurnstileApi | undefined>(undefined);

  // The widget is rendered once and calls back many times, so it calls
  // the latest `onToken` and not the one it was rendered with.
  const report = useRef(onToken);
  useEffect(() => {
    report.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const node = box.current;
    if (api === undefined || node === null) {
      return;
    }

    const rendered = api.render(node, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      callback: (token) => report.current(token),
      "expired-callback": () => report.current(undefined),
      "error-callback": () => report.current(undefined),
    });
    widgetId.current = rendered;

    return () => {
      if (rendered !== undefined) {
        api.remove(rendered);
      }
      widgetId.current = undefined;
    };
  }, [api, siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (api !== undefined && widgetId.current !== undefined) {
          api.reset(widgetId.current);
          report.current(undefined);
        }
      },
    }),
    [api],
  );

  return (
    <>
      <Script src={TURNSTILE_SCRIPT} onReady={() => setApi(window.turnstile)} />
      <div id={id} ref={box} />
    </>
  );
}
