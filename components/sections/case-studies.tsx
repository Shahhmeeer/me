import { Section } from "@/components/sections/section";
import { TechTagList } from "@/components/sections/tech-tags";
import type { CaseStudiesCopy, CaseStudy } from "@/content/site";

type CaseStudiesProps = {
  heading: string;
  caseStudies: CaseStudy[];
  copy: CaseStudiesCopy;
};

/**
 * The proof section. Each card is read as problem, what Shahmeer did, and
 * Result, so the three paragraphs keep that order and the Result is the only
 * one set in the foreground colour.
 *
 * Ownership is printed from the content module, never invented here: vagueness
 * about who built a thing reads as inflation, and `caseStudyProblems` fails the
 * build when a card carries no ownership note.
 *
 * There is nothing to click here on purpose: ADR-0001 keeps client names, org
 * screenshots and client code off this site.
 */
export function CaseStudies({ heading, caseStudies, copy }: CaseStudiesProps) {
  return (
    <Section heading={heading}>
      <p className="max-w-measure text-caption text-muted">{copy.note}</p>

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
              <span className="font-semibold text-accent">
                {copy.resultLabel}{" "}
              </span>
              {caseStudy.result}
            </p>

            <TechTagList techTags={caseStudy.techTags} />

            <p className="max-w-measure text-caption text-muted">
              {caseStudy.ownership.note}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
