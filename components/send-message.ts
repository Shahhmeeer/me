import type { ContactAnswer } from "@/app/api/contact/handler";
import type { ContactFormCopy } from "@/content/site";

/**
 * The Form's script sending a Message (ADR-0004): one post to the route,
 * and the route's answer read back as the one of three things the Form
 * does next. It is a function of the fields and a `fetch`, so a test hands
 * it a fake route and reads the outcome, and the component that calls it
 * holds nothing but state.
 */

/** `fetch`, as the browser has it; handed in so a test can be the route. */
export type Fetch = (input: string, init: RequestInit) => Promise<Response>;

/**
 * What the Form does next: swap itself for the success line; say a word
 * beside the one box the route refused, named by the field it was posted
 * under; or say the failure line, with the address, for everything else,
 * which is nothing the visitor can fix by typing.
 */
export type Outcome =
  | { outcome: "sent" }
  | { outcome: "problem"; field: string; problem: keyof ContactFormCopy["problems"] }
  | { outcome: "failed" };

/**
 * The route's answer, if this is one: JSON of the shape the route writes,
 * and nothing else. A page where JSON should be, a proxy's or a platform's,
 * and a body that will not parse, are read as no answer at all.
 */
async function answerOf(response: Response): Promise<ContactAnswer | undefined> {
  try {
    const json: unknown = await response.json();

    if (json !== null && typeof json === "object" && "ok" in json) {
      return json as ContactAnswer;
    }
  } catch {
    // Not JSON, so not the route's.
  }

  return undefined;
}

/**
 * Posts the fields as the route reads them, JSON, and reads what it says.
 * A route that cannot be reached, an answer that is not the route's, and a
 * problem the Form has no word for are all failures: the failure line
 * names the email address, and a blank line beside a box names nothing.
 */
export async function sendMessage(
  form: Pick<ContactFormCopy, "action" | "problems">,
  fields: Record<string, string>,
  fetcher: Fetch,
): Promise<Outcome> {
  let answer: ContactAnswer | undefined;

  try {
    const response = await fetcher(form.action, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(fields),
    });

    answer = response.ok || response.status === 400 ? await answerOf(response) : undefined;
  } catch {
    answer = undefined;
  }

  if (answer === undefined) {
    return { outcome: "failed" };
  }
  if (answer.ok) {
    return { outcome: "sent" };
  }
  if ("field" in answer && answer.problem in form.problems) {
    return { outcome: "problem", field: answer.field, problem: answer.problem };
  }

  return { outcome: "failed" };
}
