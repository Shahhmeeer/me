# Branching and pull requests

Every issue gets its own branch, cut fresh from `origin/main`, and `main`
moves only by pull request. This is GitHub Flow.

## What GitHub enforces

The "Protect main" ruleset on the repository, with no bypass for anyone:

- Nothing is pushed straight to `main`. Every change arrives by pull request.
- `main` cannot be force-pushed or deleted.
- The `checks` job of the Checks workflow must pass before a pull request can
  merge.

The repository also deletes the head branch when its pull request merges, so a
merged branch disappears from GitHub on its own.

Everything below is the convention that fits inside those rules.

## Before the first edit

1. `gh issue view <n>` — read the issue, and check every blocker it lists is
   closed.
2. `git fetch origin`
3. `git checkout -b <type>/<short-name> origin/main`

Cut from `origin/main`, never from whatever branch happens to be checked out.
A checked-out branch may already be merged or already be behind, and neither is
visible until push time. Work for #3 was written on #2's already-merged branch
and had to be moved afterwards; the fetch and the explicit `origin/main` are
what prevent that.

`origin/main` is the local copy of `main` as GitHub last had it, and only
`git fetch` refreshes it. Merging a pull request moves `main` on GitHub; the
fetch brings that move down; the checkout starts the new branch on top of it.
So a branch cut this way already holds every earlier merge, and the local
`main` branch is never needed for it.

Branch names are `<type>/<short-kebab-name>`, where type is `feat`, `fix`,
`docs` or `chore`.

## Before the pull request

- `npm test` — the full suite, once.
- `npx next typegen && npx tsc --noEmit`, and `npx eslint`. The typegen writes
  the generated route types a fresh clone does not have.
- Commit to the branch. Never commit to `main`.

## The pull request

`gh pr create --base main`. The body carries `Closes #<n>`, so merging closes
the issue.

One branch and one PR per issue. A merged branch is finished: new work starts
from a new branch off `origin/main`.

## After the merge

GitHub has already deleted the remote branch. Drop the local copy so the
branch list only ever shows work in progress:

```
git fetch origin --prune
git branch -d <type>/<short-name>
```

`-d` refuses a branch that is not fully merged, which is the point: a branch
that survives it still holds something `main` does not have.
