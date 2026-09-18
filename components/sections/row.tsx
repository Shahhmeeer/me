import type { ReactNode } from "react";

type RowProps = {
  /** The thing being dated: a qualification. */
  children: ReactNode;
  /** When it was, set to the right, where a Recruiter's eye goes looking. */
  date: ReactNode;
};

/**
 * One line of a dated list.
 *
 * What it is on the left, when it was on the right. Education is the one
 * dated list today; the certifications left it for their cards on Home's
 * second Spread, where a badge says more than a line. A dated list added
 * later gets the same line for free.
 */
export function Row({ children, date }: RowProps) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-body font-medium text-foreground">{children}</span>
      <span className="text-caption text-muted">{date}</span>
    </li>
  );
}
