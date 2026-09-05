# Branching and pull requests

Every issue gets its own branch, cut fresh from `origin/main`.

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

Branch names are `<type>/<short-kebab-name>`, where type is `feat`, `fix`,
`docs` or `chore`.

## Before the pull request

- `npm test` — the full suite, once.
- `npx tsc --noEmit` and `npx eslint`.
- Commit to the branch. Never commit to `main`.

## The pull request

`gh pr create --base main`. The body carries `Closes #<n>`, so merging closes
the issue.

One branch and one PR per issue. A merged branch is finished: new work starts
from a new branch off `origin/main`.
