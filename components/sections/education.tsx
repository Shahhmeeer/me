import { DateRange } from "@/components/date-range";
import { Row } from "@/components/sections/row";
import type { DateRangeCopy, Education } from "@/content/site";

type EducationProps = {
  heading: string;
  education: Education[];
  copy: DateRangeCopy;
};

/**
 * The degree. It sits under the last Role's card on the Experience Panel
 * (`components/experience-panel.tsx`), because a Recruiter checking for
 * gaps reads the two together, and so the history reads back to 2019 on
 * the last Experience screen. It is not a Role, so it keeps a heading of
 * its own, one level under the Panel as a Role's title is. It is drawn as a
 * Row, what it is and then when it was, the way every dated list on the
 * site is.
 *
 * It arrives with the card it sits under, which the Spread hands over, so
 * it wears no reveal of its own.
 */
export function EducationBlock({ heading, education, copy }: EducationProps) {
  return (
    <div className="flex flex-col gap-gutter">
      <h3 className="text-title font-semibold tracking-tight text-foreground">
        {heading}
      </h3>
      <ul className="flex flex-col">
        {education.map((entry) => (
          <Row key={entry.id} date={<DateRange range={entry} copy={copy} />}>
            {entry.qualification}
            <span aria-hidden="true"> &middot; </span>
            <span className="font-normal text-muted">{entry.institution}</span>
          </Row>
        ))}
      </ul>
    </div>
  );
}
