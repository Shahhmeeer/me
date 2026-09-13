import { PRIMARY_ACTION, TEXT_FIELD } from "@/components/interactive";
import type { ContactForm as ContactFormCopy, FormField } from "@/content/site";

type ContactFormProps = {
  form: ContactFormCopy;
};

/** The element id a field's label is bound to. Prefixed, so it is the page's once. */
function idOf(field: { name: string }): string {
  return `contact-${field.name}`;
}

/** The label a visitor reads over a field, bound to it by id. */
function Label({ field }: { field: FormField }) {
  return (
    <label htmlFor={idOf(field)} className="text-caption font-medium text-foreground">
      {field.label}
    </label>
  );
}

/**
 * The contact form: the card on the Contact Spread (ADR-0004), the second
 * way to write to Shahmeer, beside the address that is the first.
 *
 * A plain `<form method="post">` to the route's path, so it posts before
 * any script runs and with none; the client component that sends it
 * without leaving the page comes later and only adds to this. Three fields,
 * each with a visible `<label>` bound to it, so a screen reader names the
 * box and a click on the word lands in it; the email typed `email`, so a
 * phone offers the keyboard with an at sign; all three required, so an
 * empty post never leaves the browser; each told what a browser may fill
 * it with, so a visitor's own name and address are one tap. Every word is
 * the content module's.
 *
 * The fourth field is the honeypot: a box a human never meets, hidden
 * from sight by the same rule a screen-reader-only label is, and from the
 * accessibility tree by `aria-hidden`, out of the Tab order, and refused
 * autofill, so the only thing that fills it is a bot filling every box.
 * The route drops a message that arrives with it filled. It is named the
 * way a bot expects a field to be named, which is the content module's
 * choice, and the route reads it by the same name.
 *
 * The card is `relative` so the hidden box is placed against the card and
 * not against the Panel; and the card's teal hover border is its focus
 * border too, by the `.card:focus-within` rule, so a visitor typing sees
 * the whole card lit and not only the box.
 */
export function ContactForm({ form }: ContactFormProps) {
  const { name, email, message } = form.fields;

  return (
    <form
      method="post"
      action={form.action}
      className="card relative flex flex-col gap-gutter p-gutter"
    >
      <div className="flex flex-col gap-2">
        <Label field={name} />
        <input
          id={idOf(name)}
          name={name.name}
          type="text"
          required
          autoComplete="name"
          placeholder={name.placeholder}
          className={TEXT_FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label field={email} />
        <input
          id={idOf(email)}
          name={email.name}
          type="email"
          required
          autoComplete="email"
          placeholder={email.placeholder}
          className={TEXT_FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label field={message} />
        <textarea
          id={idOf(message)}
          name={message.name}
          required
          rows={5}
          placeholder={message.placeholder}
          className={`${TEXT_FIELD} resize-y`}
        />
      </div>

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

      <button type="submit" className={`${PRIMARY_ACTION} self-start`}>
        {form.submit}
      </button>
    </form>
  );
}
