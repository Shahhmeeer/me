import { describe, expect, it } from "vitest";

import * as content from "@/content/site";
import {
  ENVIRONMENT_VARIABLE,
  LOCAL_FILE,
  findForbiddenMentions,
  isContinuousIntegration,
  loadForbiddenNames,
} from "./checks/forbidden-names";
import { collectStrings } from "./checks/strings";

const list = loadForbiddenNames();
const publishedStrings = collectStrings(content);

const missingListMessage = [
  "No forbidden client-name list was found, so the confidentiality guard could not run.",
  `Set ${ENVIRONMENT_VARIABLE} (names separated by commas or newlines),`,
  `or create the gitignored file ${LOCAL_FILE} at the repo root.`,
  "The list is never committed: this repo is public.",
].join(" ");

describe("confidentiality guard", () => {
  it("has a forbidden-name list to work with", () => {
    if (list.source !== "none") {
      expect(list.names.length).toBeGreaterThan(0);
      return;
    }

    // A missing list is never silently a pass: it stops a build server, and it
    // shouts at a developer.
    if (isContinuousIntegration()) {
      expect.fail(missingListMessage);
    }

    // Console output from a passing test is swallowed by the reporter, so the
    // warning goes straight to stderr, where a developer sees it.
    process.stderr.write(`\nWARNING: ${missingListMessage}\n\n`);
    expect(list.names).toEqual([]);
  });

  it("names no forbidden client anywhere in the published content", () => {
    const mentions = findForbiddenMentions(publishedStrings, list.names);

    expect(
      mentions.map((mention) => `"${mention.name}" appears in: ${mention.text}`),
    ).toEqual([]);
  });

  it("catches a name planted in content-shaped data", () => {
    const planted = {
      caseStudies: [
        {
          clientDescriptor: "A mid-size logistics operator",
          result: "Rolled out across Acme Corp in one quarter.",
        },
      ],
    };

    expect(findForbiddenMentions(collectStrings(planted), ["acme corp"])).toHaveLength(1);
  });
});
