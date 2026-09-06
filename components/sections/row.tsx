import type { ReactNode } from "react";

type RowProps = {
  /** The thing being dated: a Certification, or a qualification. */
  children: ReactNode;
  /** When it was, set to the right, where a Recruiter's eye goes looking. */
  date: ReactNode;
};

/**
 * One line of a dated list.
 *
 * Certifications and Education are read the same way — what it is on the left,
 * when it was on the right — so they share the row rather than each keeping a
 * copy of it. A dated list added later gets the same line for free.
 */
export function Row({ children, date }: RowProps) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-body font-medium text-foreground">{children}</span>
      <span className="text-caption text-muted">{date}</span>
    </li>
  );
}
