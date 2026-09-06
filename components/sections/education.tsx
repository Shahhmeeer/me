import { DateRange } from "@/components/date-range";
import { Row } from "@/components/sections/row";
import { Section } from "@/components/sections/section";
import type { DateRangeCopy, Education } from "@/content/site";

type EducationProps = {
  heading: string;
  education: Education[];
  copy: DateRangeCopy;
};

/**
 * The degree. It follows Experience because a Recruiter checking for gaps
 * reads the two together, and it wears the same Row as Certifications, because
 * all three are read the same way: what it is, then when it was.
 */
export function EducationBlock({ heading, education, copy }: EducationProps) {
  return (
    <Section heading={heading}>
      <ul className="flex flex-col">
        {education.map((entry) => (
          <Row key={entry.id} date={<DateRange range={entry} copy={copy} />}>
            {entry.qualification}
            <span aria-hidden="true"> &middot; </span>
            <span className="font-normal text-muted">{entry.institution}</span>
          </Row>
        ))}
      </ul>
    </Section>
  );
}
