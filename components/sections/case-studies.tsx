import { TechTagList } from "@/components/sections/tech-tags";
import type { CaseStudiesCopy, CaseStudy } from "@/content/site";

type CaseStudyCardProps = {
  caseStudy: CaseStudy;
  copy: CaseStudiesCopy;
};

/**
 * One Case Study's card: the proof, and the reason the site exists. It is
 * read as who for, the problem, what Shahmeer did, and the Result, so the
 * three paragraphs keep that order and the Result is the only one set in the
 * foreground colour.
 *
 * The title is not here. Each Case Study is a Spread of the Work Panel, in
 * `components/work-panel.tsx`, and the title is that Spread's large heading
 * beside the card; the card is the detail under it. The Case Studies note,
 * why there is nothing to click, is on the first Spread, so it is read before
 * the first card as it always was.
 *
 * Ownership is printed from the content module, never invented here: vagueness
 * about who built a thing reads as inflation, and `caseStudyProblems` fails the
 * build when a card carries no ownership note.
 *
 * There is nothing to click here on purpose: ADR-0001 keeps client names, org
 * screenshots and client code off this site.
 */
export function CaseStudyCard({ caseStudy, copy }: CaseStudyCardProps) {
  return (
    <article className="card flex flex-col gap-3 p-gutter">
      <p className="text-caption text-muted">
        <span className="text-foreground">{caseStudy.employer}</span>
        <span aria-hidden="true"> &middot; </span>
        {caseStudy.clientDescriptor}
      </p>

      <p className="max-w-measure text-body text-muted">{caseStudy.problem}</p>

      <p className="max-w-measure text-body text-muted">{caseStudy.action}</p>

      <p className="max-w-measure text-body text-foreground">
        <span className="font-semibold text-accent">{copy.resultLabel} </span>
        {caseStudy.result}
      </p>

      <TechTagList techTags={caseStudy.techTags} />

      <p className="max-w-measure text-caption text-muted">
        {caseStudy.ownership.note}
      </p>
    </article>
  );
}
