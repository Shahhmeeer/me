import { Section } from "@/components/sections/section";
import type { CaseStudy, Ownership } from "@/content/site";

type CaseStudiesProps = {
  heading: string;
  caseStudies: CaseStudy[];
  /** Why none of these cards carries a link. */
  note: string;
};

/**
 * Ownership in the words a visitor reads. Vagueness reads as inflation, so a
 * card never renders without this line.
 */
function ownershipLine(ownership: Ownership): string {
  if (ownership.kind === "team") {
    return ownership.note;
  }

  return ownership.note ?? "Built solo.";
}

/**
 * The proof section. Each card is read as problem, what Shahmeer did, and
 * Result, so the three paragraphs keep that order and the Result is the only
 * one set in the foreground colour.
 *
 * There is nothing to click here on purpose: ADR-0001 keeps client names, org
 * screenshots and client code off this site.
 */
export function CaseStudies({
  heading,
  caseStudies,
  note,
}: CaseStudiesProps) {
  return (
    <Section heading={heading}>
      <p className="max-w-measure text-caption text-muted">{note}</p>

      <div className="flex flex-col gap-block">
        {caseStudies.map((caseStudy) => (
          <article key={caseStudy.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lead font-semibold tracking-tight text-foreground">
                {caseStudy.title}
              </h3>
              <p className="text-caption text-muted">
                <span className="text-foreground">{caseStudy.employer}</span>
                <span aria-hidden="true"> &middot; </span>
                {caseStudy.clientDescriptor}
              </p>
            </div>

            <p className="max-w-measure text-body text-muted">
              {caseStudy.problem}
            </p>

            <p className="max-w-measure text-body text-muted">
              {caseStudy.action}
            </p>

            <p className="max-w-measure text-body text-foreground">
              <span className="font-semibold text-accent">Result. </span>
              {caseStudy.result}
            </p>

            <ul className="flex flex-wrap gap-2">
              {caseStudy.techTags.map((techTag) => (
                <li
                  key={techTag.name}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption font-medium text-foreground"
                >
                  {techTag.name}{" "}
                  <span className="font-normal text-muted">{techTag.year}</span>
                </li>
              ))}
            </ul>

            <p className="max-w-measure text-caption text-muted">
              {ownershipLine(caseStudy.ownership)}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
