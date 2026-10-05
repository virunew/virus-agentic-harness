# Agent Operating Policy

## TOC

- [Purpose](#purpose)
- [Precedence](#precedence)
- [The work loop](#the-work-loop)
- [Test environment](#test-environment)
- [Test-first](#test-first)
- [Batch work](#batch-work)
- [Status page](#status-page)
- [Diagnosis](#diagnosis)
- [Plans and modules](#plans-and-modules)
- [Records, not a logging framework](#records-not-a-logging-framework)
- [Git, the graph, and the harness](#git-the-graph-and-the-harness)
- [When to stop and ask](#when-to-stop-and-ask)

## Purpose

This is the long form of how agents work in the Desk Clerk training repository. `CLAUDE.md`, `AGENTS.md`, and the Cursor rule are a map. They link here. They do not copy this page.

Desk Clerk is the example application. The subject is the method.

## Precedence

1. What the user asked for in the current conversation.
2. Simplicity: the smallest readable change that still does what was asked.
3. Every other rule.

A one-step fix does not get an ExecPlan, a second working tree, a code-graph tour, or a new glossary entry. Safety still applies inside a simple change: tests load `env.test` only, a re-run does not duplicate accepted tickets, and a status page is not done until someone can open it.

## The work loop

Each stage answers one question and writes one kind of artifact. The next stage reads that artifact. It does not re-decide the previous question.

| Stage | Skill | Question | Where it lands |
| --- | --- | --- | --- |
| Ideate | ce-ideate | Which ideas are worth exploring? | `docs/ideation/` |
| Brainstorm | ce-brainstorm | What should we build? | `docs/brainstorms/` |
| Plan | ce-plan | How do we build this one goal? | `docs/plans/` as an ExecPlan |
| Document review | ce-doc-review | Would this plan cause the wrong work? | Edits and a short review note inside the plan |
| Vet | vet-reviews | Which outside comments do we accept? | An accept or reject note before code changes |
| Work | ce-work | Does the plan now behave as specified? | Code, tests, and the living plan sections |
| Code review | ce-code-review | Does the diff match the plan? | Findings. Apply them only when asked, after vetting |
| Compound | ce-compound | Would a future agent repeat this mistake? | `docs/solutions/`, only if the bar is met |

The older name `ce:review` means `ce-code-review`.

Vet is a filter, not a second author. Use it after document review when another model commented, and again after code review comments from another model. Reject comments that add behavior nobody asked for. Reject comments that fight this policy.

Compound writes one learning only when the reasoning would be lost from the final code, tests, and existing docs. A large diff does not qualify. If the note vanished, would the next person repeat the mistake? If not, write nothing.

Before a significant fix, search `docs/solutions/` so a known incident is not solved again from scratch.

A confidence pass on a plan and a document review are different. The confidence pass strengthens rationale and sequencing. The document review checks coherence, feasibility, and scope. Do both for a durable plan.

Direct answers and one-step fixes do not write a plan file.

## Test environment

Automated tests and the live status-page check used by tests load `env.test` only. They never load `env.demo`. There is no file named `env`. If a variable the run needs is missing, the loader raises. It does not fill in a default database path.

`scripts/activate_test_env.sh` activates `.venv` when that directory already exists, exports `env.test`, and fails unless `DESKCLERK_ENV` is `test`. It creates nothing. Pytest refuses the session when `DESKCLERK_ENV` is not `test`.

A green run that loaded `env.demo` is a failed build, not a pass.

Details: [testing.md](testing.md) and [configuration.md](configuration.md).

## Test-first

Every code change follows red, green, refactor, one behavior at a time. Do not write the whole suite first and then the implementation.

When a test is added, state the behavior in plain language, why the layer is unit or integration, the exact pytest command, and what the red failure looked like before the code existed. For later work, put that in the commit message body or the pull request text. Plan 001 keeps the seed example in its Validation section.

A bug fix starts from a regression test that fails on the unfixed code.

Layers:

- Unit tests call `accept_line` with an in-memory SQLite connection. They live in `tests/unit/`.
- Integration tests run the batch module and read `GET /`. They live in `tests/integration/`. They open a temporary SQLite file. They do not open `var/demo/` or `var/test/`.

## Batch work

The full contract is [docs/architecture/batch-contract.md](../architecture/batch-contract.md).

- Idempotent. The same file twice does not create a second accepted ticket or a second failure row for the same identity.
- Durable failure. A failed unit is a row with a stable identity, not only a line of output.
- Resume. Tickets already in `tickets` are skipped. The accepted row is the checkpoint.
- Recovery without the chat. A later invocation with a corrected line can accept a previously failed `ticket_id` because the identity is still in the database.

## Status page

The page is the UI in this repository. It is HTML from the standard library, in `src/deskclerk/web.py`. Do not add a component library or a second styling system.

- Verify by starting `python -m deskclerk.web` against `env.demo` after a demo batch, and by the integration test against the test loader. The integration test is the repeatable check. The demo server is what a person clicks. Do not point a test at `env.demo`.
- Check the page with tickets present, with an empty database, and with at least one failure. A single look at the happy path is not enough.
- Look at a narrow window, about 375 pixels wide, and a desktop window, about 1200 pixels wide. The column must remain readable.
- This repository has one page. If a later plan adds a second page that reads the same database, both pages are checked.
- Before changing the markup to chase a visual symptom, check the counts in the database first. The first bad step may be the batch, not the HTML.

## Diagnosis

For a bug, name the first bad step. Separate the cause from the later symptoms. Fix the cause. If a change only hides the symptom, say so.

## Plans and modules

Follow [PLANS.md](../../PLANS.md) and [docs/architecture/planning-scope-and-modularity.md](../architecture/planning-scope-and-modularity.md).

One easily achievable goal per plan. `accept_line` is the deep module. A chain of one-function files is the shape to avoid. Modularity does not authorize extra features.

Where a decision lives:

| Layer | Path |
| --- | --- |
| This plan | Decision Log inside the ExecPlan |
| Standing style | `docs/architecture/planning-scope-and-modularity.md` |
| Domain design | `docs/architecture/` |
| Settled choices | `docs/solutions/architecture-decisions/` |
| Incidents | `docs/solutions/` |
| Vocabulary | `docs/references/CONCEPTS.md` |
| Every turn | `CLAUDE.md`, `AGENTS.md`, the Cursor rule |

The code graph is not the glossary. Do not merge them.

## Records, not a logging framework

The batch command prints three counts. Accepted tickets and failures are rows in SQLite. That row is the audit record a later session can read without the chat.

Do not add a logging framework, a second audit store, or log lines on code the task did not change. Do not log secrets. This training repository has none in its env files. If a later plan adds a secret, it stays out of the page, the sample file, and git.

## Git, the graph, and the harness

Chat is not the archive. Commit coherent changes. Do not keep `_old` files, backup copies, or commented-out previous versions. Do not commit secrets, databases, or `var/`.

Stay on the current branch unless the user asks for another. Do not push or merge unless the user asks. Do not force-push the default branch. Do not skip hooks. Stage named paths.

- Git tools: [git.md](git.md)
- Code graph and worktrees: [code-graph-and-worktrees.md](code-graph-and-worktrees.md)
- Keeping the every-turn files short: [harness-maintenance.md](harness-maintenance.md)
- The producer outside this repo: [docs/architecture/sibling-producer-contract.md](../architecture/sibling-producer-contract.md)

## When to stop and ask

Ask before reducing backward compatibility, before changing the storage or the failure classes, and when a plan has two goals. If a further improvement looks useful, stop and ask. Do not add it first.
