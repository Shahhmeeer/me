import type { DateRange as Dates, DateRangeCopy } from "@/content/site";

type DateRangeProps = {
  range: Dates;
  copy: DateRangeCopy;
};

/**
 * When something started and when it ended, printed as one phrase.
 *
 * Experience and Education both print one, and both must print it the same
 * way: a Recruiter scanning for a gap is comparing two blocks against each
 * other, so a separator that differed between them would be read as a
 * difference in meaning.
 */
export function DateRange({ range, copy }: DateRangeProps) {
  return (
    <>
      {range.start}
      {copy.dateSeparator}
      {range.end}
    </>
  );
}
