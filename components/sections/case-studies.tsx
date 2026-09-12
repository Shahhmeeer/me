import { Block } from "@/components/sections/block";
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
 * It is a block of cards: they stack on a small display and are a row on the
 * Strip that a visitor slides past, one card at a time. The note is in the
 * head of the block, so why there is nothing to click is read before the
 * first card either way.
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
    <Block heading={heading} note={copy.note} cards>
      {caseStudies.map((caseStudy) => (
        <article
          key={caseStudy.id}
          className="card flex flex-col gap-3 p-gutter"
        >
          <div className="flex flex-col gap-1">
            <h4 className="text-lead font-semibold tracking-tight text-foreground">
              {caseStudy.title}
            </h4>
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
    </Block>
  );
}
