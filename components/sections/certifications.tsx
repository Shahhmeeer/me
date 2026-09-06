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
    <Section title={heading}>
      <ul className="flex flex-col">
        {certifications.map((certification) => (
          <li
            key={certification.name}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <span className="text-body font-medium text-foreground">
              {certification.name}
            </span>
            <span className="text-caption text-muted">
              {certification.awarded}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
