import { DateRange } from "@/components/date-range";
import { Block } from "@/components/sections/block";
import { Row } from "@/components/sections/row";
import type { DateRangeCopy, Education } from "@/content/site";

type EducationProps = {
  heading: string;
  education: Education[];
  copy: DateRangeCopy;
};

/**
 * The degree. It follows Experience because a Recruiter checking for gaps
 * reads the two together. It is drawn as a Row, what it is and then when it
 * was, the way every dated list on the site is, and on the Strip the list is
 * given a width for the two ends of the Row to sit apart in.
 */
export function EducationBlock({ heading, education, copy }: EducationProps) {
  return (
    <Block heading={heading}>
      <ul className="flex flex-col large:w-112 large:shrink-0">
        {education.map((entry) => (
          <Row key={entry.id} date={<DateRange range={entry} copy={copy} />}>
            {entry.qualification}
            <span aria-hidden="true"> &middot; </span>
            <span className="font-normal text-muted">{entry.institution}</span>
          </Row>
        ))}
      </ul>
    </Block>
  );
}
