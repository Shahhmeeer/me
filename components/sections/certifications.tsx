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
 */
export function Certifications({
  heading,
  certifications,
}: CertificationsProps) {
  return (
    <Section heading={heading}>
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
