This package is Desk Clerk, and the nearest nested guide wins over this file.

## Precedence

When instructions compete, use this order:

1. What the user asked for in the current conversation.
2. Simplicity: the smallest change a person can read that still produces the requested behavior.
3. Every other rule in this repository.

A one-step fix does not get an execution plan or a worktree.

## Pointers

- `docs/references/agent-operating-policy.md`
- `PLANS.md`
- `docs/references/CONCEPTS.md`
- `docs/critical/00-index.md`

## Tests

`source scripts/activate_test_env.sh && pytest`

Tests and live checks load `env.test` only.

## Plans

One easily achievable goal per plan. Name the file `docs/plans/YYYY-MM-DD-NNN-slug-plan.md`.

## Batch

Re-running the same input must not duplicate accepted tickets, failures are upserted by identity, and completed tickets are skipped.

## Status page

A status-page change is verified by opening the page, including the empty and failed states, at a narrow width and a desktop width.

## Git

Commit coherent changes, tag a finished plan, and do not create a worktree unless the user asks.

## Harness

If this file grows by duplication, move the procedure into `docs/` and leave a link.
