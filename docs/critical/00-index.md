# Critical Rules

## TOC

- [Purpose](#purpose)
- [Non-negotiables](#non-negotiables)
- [Where the full text lives](#where-the-full-text-lives)

## Purpose

This page lists the rules that must not be dropped when the every-turn files are pruned. It is an index. It is not a second copy of the operating policy.

## Non-negotiables

- The user request wins, then simplicity, then every other rule. A one-step fix does not get a plan or a worktree.
- Tests and live checks load `env.test` only. There is no file named `env`, and the loader does not invent a database path.
- Re-running a batch must not duplicate an accepted ticket. Failures are upserted by identity. The accepted row is the checkpoint.
- A status-page change is verified by opening the page, including the empty and failed states, at a narrow width and a desktop width.
- One easily achievable goal per plan. Test-first: red, then green, then refactor.
- `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/core-rules/agent-policy.mdc` change together. Nested guides hold local facts. The root files do not repeat them.
- Do not commit secrets, databases, or `var/`.

## Where the full text lives

- Every turn: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/core-rules/agent-policy.mdc`
- Package facts: `src/deskclerk/CLAUDE.md`
- Operating policy: [docs/references/agent-operating-policy.md](../references/agent-operating-policy.md)
- Plans: [PLANS.md](../../PLANS.md)
- Words: [docs/references/CONCEPTS.md](../references/CONCEPTS.md)
- Batch behavior: [docs/architecture/batch-contract.md](../architecture/batch-contract.md)
