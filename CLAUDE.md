@AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Branching

Every issue gets its own branch, cut fresh from `origin/main` before the first
edit: `git fetch origin && git checkout -b <type>/<name> origin/main`. Never
build on the branch that happens to be checked out. See `docs/agents/branching.md`.

### Triage labels

Default label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (one CONTEXT.md + docs/adr/ at the repo root). See `docs/agents/domain.md`.
