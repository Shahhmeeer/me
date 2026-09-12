import { Block } from "@/components/sections/block";
import { Row } from "@/components/sections/row";
import type { Certification } from "@/content/site";

type CertificationsProps = {
  heading: string;
  certifications: Certification[];
};

/**
 * The Recruiter's first filter, so it sits on the Home Panel under the About
 * sentences. Each certification shows its award date, because a Recruiter
 * judges how current it is.
 *
 * It is the one block that does not fade in. Sitting where it does, it is on
 * screen the moment the page loads, and the first filter a Recruiter applies
 * must not wait on JavaScript. It is headed one level under the Headline,
 * because Home has no heading between the two.
 */
export function Certifications({
  heading,
  certifications,
}: CertificationsProps) {
  return (
    <Block heading={heading} alreadyOnScreen level={2}>
      <ul className="flex flex-col">
        {certifications.map((certification) => (
          <Row key={certification.name} date={certification.awarded}>
            {certification.name}
          </Row>
        ))}
      </ul>
    </Block>
  );
}
