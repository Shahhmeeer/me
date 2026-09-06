import { Row } from "@/components/sections/row";
import { Section } from "@/components/sections/section";
import type { Certification } from "@/content/site";

type CertificationsProps = {
  heading: string;
  certifications: Certification[];
};

/**
 * The Recruiter's first filter, so it sits directly under the Header. Each
 * certification shows its award date, because a Recruiter judges how current it
 * is.
 *
 * It is the one block that does not fade in. Sitting where it does, it is on
 * screen the moment the page loads, and the first filter a Recruiter applies
 * must not wait on JavaScript.
 */
export function Certifications({
  heading,
  certifications,
}: CertificationsProps) {
  return (
    <Section heading={heading} alreadyOnScreen>
      <ul className="flex flex-col">
        {certifications.map((certification) => (
          <Row key={certification.name} date={certification.awarded}>
            {certification.name}
          </Row>
        ))}
      </ul>
    </Section>
  );
}
