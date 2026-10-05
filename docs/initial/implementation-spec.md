# Implementation Spec: Agentic Coding Methodology Training Repo

## TOC

- [Purpose](#purpose)
- [What this repo is](#what-this-repo-is)
- [Precedence](#precedence)
- [Example application](#example-application)
- [Repository layout](#repository-layout)
- [Policy files for three agents](#policy-files-for-three-agents)
- [The work loop](#the-work-loop)
- [ExecPlans](#execplans)
- [Where a decision lives](#where-a-decision-lives)
- [Ontology](#ontology)
- [Docs tree](#docs-tree)
- [Tests and the test environment](#tests-and-the-test-environment)
- [Rules by kind of work](#rules-by-kind-of-work)
- [Git as the system of record](#git-as-the-system-of-record)
- [Maintaining the harness](#maintaining-the-harness)
- [Code graph and worktrees](#code-graph-and-worktrees)
- [Sibling systems](#sibling-systems)
- [What to check in on the first implementation](#what-to-check-in-on-the-first-implementation)
- [How a training session uses the repo](#how-a-training-session-uses-the-repo)
- [Build order](#build-order)
- [Acceptance](#acceptance)
- [Out of scope](#out-of-scope)

## Purpose

Build a small Python repository that people can clone and use while learning one agentic coding method. The application is a prop. The subject is the method: how several coding agents share written rules, how work moves from an idea to a reviewed plan to test-first code, and how decisions survive after the chat ends.

A later reader, human or agent, must be able to implement this repository from this file alone. This file is the bootstrap spec. After the repository exists, new work uses execution plans under `docs/plans/`. Do not add further bootstrap specs beside this one.

This repository is original. Do not copy code, names, documents, data, or environment files from any other project.

## What this repo is

The repository is a local **desk clerk**. It reads a file of tickets, accepts the valid ones, records the invalid ones, and shows a one-page status view. Re-running the same file does not duplicate accepted tickets. A later run continues with tickets that are not yet accepted. It does not start the file over in the sense of redoing completed work.

The name in prose is Desk Clerk. The Python package is `deskclerk`.

The repository also contains the written method: agent policy files, a concepts glossary, a docs tree, one finished example of the full work loop, and one unimplemented exercise plan that a class can carry out.

It is not a framework, a skill installer, or a general agent platform. Skills such as ideate, brainstorm, plan, document review, vet, work, code review, and compound stay installed on the trainee's machine. This repo shows where their artifacts go and which rules they must follow here.

## Precedence

When instructions compete, use this order:

1. What the user asked for in the current conversation.
2. Simplicity: the smallest change a person can read that still produces the requested behavior.
3. Every other rule in this spec and in the policy files.

Simplicity sits above the rest of the method. A one-step fix does not get an execution plan, a second working tree, a code-graph tour, or a new glossary entry. Those tools are for work that is multi-step, easy to get wrong twice, or hard to resume.

Prefer the simplest design that works. Prefer readable code over a clever abstraction. Change as few lines as the fix needs. Do not optimize before something is slow. Do not add an edge case, fallback, retry policy, cache, logging system, or validation that nobody asked for. If a further improvement looks useful, stop and ask.

Safety rules still apply inside a simple change. Tests load the test environment only. A batch re-run must not duplicate accepted tickets. A status page is not done until someone can open it. Those constraints do not justify extra behavior.

Modularity shapes the code that was requested. It is not a reason to split files the change does not need.

## Example application

### Behavior

Input is a UTF-8 JSON Lines file. Each non-empty line is one JSON object with three fields:

- `ticket_id`: a string matching `^[a-z0-9-]{1,40}$`
- `desk`: a non-empty string of at most 40 characters
- `body`: a non-empty string of at most 500 characters

A valid line is accepted. The clerk stores one row per `ticket_id`. A later run that sees the same `ticket_id` skips it and leaves the stored row unchanged.

An invalid line is a durable failure. The rest of the file still runs. Failure classes are only these three:

- `unreadable_line` when the line is not a JSON object
- `invalid_id` when `ticket_id` is missing or does not match the pattern
- `invalid_ticket` when `desk` or `body` is missing, empty, or too long

The failure identity is `failure_class` + program name `deskclerk.batch` + `ticket_id`. For `unreadable_line`, there is no id, so the identity uses the 1-based line number as `ticket_id` with the prefix `line-` (for example `line-4`). Re-running the same failure updates that row. It does not insert a second row.

If a previously failed `ticket_id` is valid on a later run, the clerk accepts it and deletes failure rows for that `ticket_id`. Line-numbered unreadable failures are not auto-deleted, because a later edit can shift line numbers. The status page shows them until a human removes the sqlite file or a later plan defines a cleanup. Do not invent that cleanup in the first build.

The command prints three integers: accepted, skipped, failed.

```text
python -m deskclerk.batch --input samples/tickets.jsonl
accepted=2 skipped=0 failed=1
```

The status page is HTML from the standard library, with no JavaScript framework and no component library. `GET /` shows accepted count, skipped-on-last-run is not required, failed count, and the list of current failure identities. Last-run skipped count is out of scope.

```text
python -m deskclerk.web --port 8765
```

Opening `http://127.0.0.1:8765/` shows those counts. The page uses a single readable column, a heading, and one table. It must be understandable at a narrow phone width and at a desktop width. Do not add a second styling system.

### Storage

SQLite, one file, two tables.

`tickets`:

- `ticket_id` text primary key
- `desk` text not null
- `body` text not null
- `accepted_at` text not null, ISO-8601 UTC

`failures`:

- `failure_class` text not null
- `program` text not null
- `ticket_id` text not null
- `detail` text not null
- `updated_at` text not null
- primary key `(failure_class, program, ticket_id)`

No other tables in the first build.

### Code shape

`src/deskclerk/batch.py` is the command. It parses arguments, opens the database, reads lines, and prints the counts. It does not contain the validation and write rules.

`src/deskclerk/batch_helpers/accept.py` is the deep module. One public function:

```text
accept_line(conn, line_number, line) -> "accepted" | "skipped" | "failed"
```

Parsing, the three failure classes, the insert-or-skip of tickets, and the upsert-or-delete of failures stay inside that module. Callers do not assemble those steps.

`src/deskclerk/web.py` reads the same database and writes the HTML. It does not import a web framework.

`src/deskclerk/env.py` loads the environment file named by the caller. It has no default path and no fallback file.

Do not add a fourth module to make the files shorter. A helper that only forwards to another function is a mistake.

### Sample data

`samples/tickets.jsonl` has four lines: two valid tickets, one invalid id, one empty body. It is safe to commit. It contains no personal data.

## Repository layout

```text
deskclerk-repo/
├── PLANS.md
├── README.md
├── CLAUDE.md
├── AGENTS.md
├── pyproject.toml
├── .gitignore
├── env.test
├── env.demo
├── .cursor/rules/core-rules/agent-policy.mdc
├── scripts/activate_test_env.sh
├── samples/tickets.jsonl
├── src/deskclerk/
│   ├── CLAUDE.md
│   ├── __init__.py
│   ├── __main__.py
│   ├── env.py
│   ├── batch.py
│   ├── web.py
│   └── batch_helpers/accept.py
├── tests/
│   ├── conftest.py
│   ├── unit/test_accept_line.py
│   └── integration/test_batch_and_status.py
└── docs/
    ├── initial/implementation-spec.md
    ├── critical/00-index.md
    ├── architecture/
    ├── ideation/
    ├── brainstorms/
    ├── plans/
    ├── solutions/architecture-decisions/
    ├── references/
    └── prompts/
```

`var/` is gitignored. Demo and test databases live under `var/demo/` and `var/test/`. Tests create their database in a temporary directory and do not use `var/demo/`.

`README.md` is one screen: what Desk Clerk does, the test command, the demo command, and a pointer to `docs/references/agent-operating-policy.md` and this spec. It does not restate the method.

Python is 3.11 or newer. Dependencies are `pytest` only. Declare them in `pyproject.toml`. Do not add a web framework, an ORM, or a CLI framework.

## Policy files for three agents

Three files carry the same policy. Claude Code reads `CLAUDE.md`. Codex reads `AGENTS.md`. Cursor reads `.cursor/rules/core-rules/agent-policy.mdc` with `alwaysApply: true`. A change to a rule is copied into all three in the same change. The long form lives in `docs/`. The three files stay a map.

Each of the three files contains, in this order:

1. One sentence that this package is Desk Clerk and that the nearest nested guide wins over this file.
2. The precedence block: user request, then simplicity, then other rules. State that a one-step fix does not get a plan or a worktree.
3. Pointers: `docs/references/agent-operating-policy.md`, `PLANS.md`, `docs/references/CONCEPTS.md`, `docs/critical/00-index.md`.
4. Test command: `source scripts/activate_test_env.sh && pytest`. State that tests and live checks load `env.test` only.
5. One-goal plan rule and the plan filename pattern.
6. Batch rule in one sentence: re-running the same input must not duplicate accepted tickets, failures are upserted by identity, and completed tickets are skipped.
7. UI rule in one sentence: a status-page change is verified by opening the page, including the empty and failed states, at a narrow width and a desktop width.
8. Git rule in one sentence: commit coherent changes, tag a finished plan, do not create a worktree unless the user asks.
9. Harness rule in one sentence: if this file grows by duplication, move the procedure into `docs/` and leave a link.

`src/deskclerk/CLAUDE.md` is the nested guide. It only says: batch orchestration stays in `batch.py`, acceptance rules stay in `batch_helpers/accept.py`, and the environment loader never chooses a file by default. It points at the package `CLAUDE.md` for everything else.

Root files do not repeat the nested guide.

`docs/critical/00-index.md` lists the non-negotiables and links to the policy files. It does not become a second copy of the operating policy.

## The work loop

Each stage answers one question and writes one kind of artifact. The next stage reads that artifact. It does not re-decide the previous question.

| Stage | Skill | Question | Where it lands in this repo |
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

Vet is a filter, not a second author. Use it after document review when another model commented, and again after code review comments from another model. Reject comments that add behavior nobody asked for. Reject comments that fight the written policy.

Compound writes one learning only when the reasoning would be lost from the final code, tests, and existing docs. A large diff does not qualify. If the note vanished, would the next person repeat the mistake? If not, write nothing.

Before a significant fix, search `docs/solutions/` so a known incident is not solved again from scratch.

A confidence pass on a plan and a document review are different. The confidence pass strengthens rationale and sequencing. The document review checks coherence, feasibility, and scope. Do both for a durable plan. Do not skip document review because a confidence pass already ran.

Direct answers and one-step fixes do not write a plan file. Work that touches persistent data, the batch command, or the status page contract is a durable ExecPlan when it is more than a one-step fix.

## ExecPlans

`PLANS.md` at the repository root is the spec for execution plans. Plans are files under `docs/plans/`. `PLANS.md` must require the following. Write it in this repo's own words. Do not paste another project's plan spec.

An ExecPlan is for an agent with no memory of the design conversation. The reader is a novice with the working tree and that one file.

Every plan file:

- Is named `docs/plans/YYYY-MM-DD-NNN-slug-plan.md`
- Has a three-digit `NNN` unique across the whole `docs/plans/` tree, including any future `completed/` or `archive/` folder
- States `Plan ID: NNN` near the top
- Says it is governed by the root `PLANS.md`
- Uses prose. The only checklist is `Progress`
- Defines any unusual term in the file
- States the outcome a person can observe, separate from the chosen approach
- Names real commands, including `source scripts/activate_test_env.sh && pytest` when tests are involved
- Is updated when the work proceeds, including a note at the bottom when the plan is revised

One easily achievable goal per file. If a draft has two outcomes that could ship separately, stop and ask to split. Related plans may later share a subfolder. A phase plan may sequence child plans. It must not absorb their work.

One-time scripts, if a plan needs them, live at `scripts/adhoc/NNN-slug.py` and are named in the plan. The first build needs none.

Required sections, in this order, and the problem each one solves:

| Section | Problem it solves |
| --- | --- |
| Purpose / Big Picture | Stops a plan that only describes code. Says what someone can do afterward and how to see it. If the approach is already fixed, put it on a `Means:` line that points at the Decision Log. |
| Progress | Lets a later session resume. Timestamped checkboxes. A half-done step is split into done and remaining. |
| Surprises & Discoveries | Keeps evidence that would die in chat, with a command transcript or a failing test name. |
| Decision Log | Stops re-deciding. Each entry has the decision, the rationale, and the date. |
| Outcomes & Retrospective | At a milestone, compares the result with the original purpose. |
| Context and Orientation | Teaches the current code. Names files. Does not say "as discussed". |
| Plan of Work | Says which file and which function change, in prose. It does not paste the finished patch. |
| Concrete Steps | Exact commands, the working directory, and a short expected transcript. |
| Validation and Acceptance | A behavior someone can check. Names the test command in the test environment, and which new test fails before the change and passes after. |
| Idempotence and Recovery | Which steps are safe to repeat, how to retry a halfway failure, and how to roll back anything destructive. |
| Artifacts and Notes | The short output that proves success. |
| Interfaces and Dependencies | The functions that must exist at the end, so the agent does not invent a second library. |

Milestones, if used, tell a story: goal, work, result, proof. Progress remains the checkbox grain. A prototype milestone is labeled as a prototype and says how to keep it or delete it.

After the commit that finishes a plan, create a local annotated tag `plan-NNN-short-name`. Do not push it unless the user asks. Ordinary commits are not tagged.

The seeded plan `docs/plans/2026-10-05-001-accept-ticket-batch-plan.md` is written as a finished example. Its Progress boxes are checked. Its Decision Log records at least: JSON Lines rather than a directory of files, SQLite rather than a hand-rolled file format, three failure classes and no more, and the standard-library status page rather than a web framework. Its Validation section names the tests below and quotes the expected batch print line. Its retrospective says what a trainee should notice: the plan was the memory, the tests were the proof, and no second storage engine was added.

The exercise plan `docs/plans/2026-10-05-002-show-failure-detail-on-status-page-plan.md` is written and not implemented. Its goal is one observable change: the status page shows `detail` for each failure, not only the identity. Its Progress boxes are open. Implementing it is class work, not part of the first build. Do not implement plan 002 while building the repo.

## Where a decision lives

| Layer | Path | Use it for |
| --- | --- | --- |
| This plan | Decision Log inside the ExecPlan | Choices made while building that one goal |
| Standing style | `docs/architecture/planning-scope-and-modularity.md` | One goal per plan, deep modules, helper placement, simplicity versus extra files |
| Domain design | `docs/architecture/` | Who owns a job, what a re-run may do, what the status page may assume |
| Settled choices | `docs/solutions/architecture-decisions/` | A choice a future agent would otherwise reopen, including what was rejected |
| Incidents | `docs/solutions/` | A solved failure whose reasoning is not obvious from the code |
| Vocabulary | `docs/references/CONCEPTS.md` | Names that must mean the same thing in every later plan |
| Every turn | `CLAUDE.md`, `AGENTS.md`, the Cursor rule | Short non-negotiables and links |

`docs/architecture/planning-scope-and-modularity.md` states the deep-module rule with the `accept_line` function as the good example, and a chain of one-function files as the bad example. It states that modularity does not authorize extra features.

`docs/solutions/architecture-decisions/sqlite-ledger-not-json-files.md` records the decision to use one SQLite file. It records the rejected alternative: a JSON file per ticket. The rationale is one sentence: a unique key makes the re-run an update, which a pile of JSON files does not.

## Ontology

The 2026 public discussion of ontology says agents need a canonical model of the domain: the objects, the relationships, and the invariants, not only a chat glossary. Knowledge-layer writing splits that into what the words mean, what is true in the data now, and what was learned. A typed world model is the same idea as a ubiquitous language, written so a machine could check it. This training repo does the first part on purpose. It does not build a formal schema language, a graph database, or a runtime that blocks illegal agent actions.

`docs/references/CONCEPTS.md` is the glossary. It defines these terms and the confusions they must avoid:

- **Ticket.** One desk item identified by `ticket_id`. It is not a failure row.
- **Accepted ticket.** A row in `tickets`. Acceptance is idempotent. A second sighting of the same id is a skip, not a second ticket.
- **Failure.** A row in `failures`. It is not a log line. The same identity updates one row.
- **Line failure.** An `unreadable_line` keyed by `line-N`. It is not a ticket id. Fixing a later line does not silently clear it.
- **Batch run.** One invocation of `python -m deskclerk.batch` on one file. It is not required to be the first run. Completed tickets are skipped.
- **Status page.** The HTML view of current counts and failure identities. It is not an editor. It does not accept tickets.
- **Test environment.** The process loaded from `env.test`. It is not the demo database under `var/demo/`.
- **Demo environment.** The process loaded from `env.demo` for a person clicking the page. Tests must not load it.
- **ExecPlan.** A living plan file governed by `PLANS.md`. It is not a requirements note and not a chat summary.
- **Simplicity.** The smallest readable change that does what was asked. It is not a reason to skip the test environment or to duplicate accepted tickets.

Each ExecPlan still defines any term it uses, so a cold agent can read the plan without the glossary. The glossary stops those definitions from drifting apart.

The code graph described later maps functions to files. It is not this glossary. Do not merge them.

## Docs tree

There is no docs folder above this repository. Each document starts with a table of contents.

| Folder | Role in the first build |
| --- | --- |
| `docs/initial/` | This bootstrap spec only |
| `docs/critical/` | `00-index.md` |
| `docs/architecture/` | Modularity note, batch contract, sibling contract |
| `docs/ideation/` | One ranked idea note for the seed feature |
| `docs/brainstorms/` | One requirements note for the seed feature |
| `docs/plans/` | Plan 001 finished, plan 002 unstarted |
| `docs/solutions/` | One architecture decision, one short learning |
| `docs/references/` | Operating policy, concepts, testing, git, harness maintenance |
| `docs/prompts/` | Empty except a `README.md` that says operator prompts are not agent policy |

`docs/architecture/batch-contract.md` states idempotence, the failure identity, and resume behavior in one page. The code and the tests must match it. Do not add a second copy of those rules inside `CLAUDE.md`.

The seeded ideation note lists three ideas and rejects two in a sentence each. The survivor is "accept a JSON Lines file into SQLite and show counts." Reject "a web form that creates tickets" and "a plugin system for desks" as extra products.

The seeded requirements note states the observable behavior, the non-goals (no web form, no plugin system, no cleanup of `line-N` failures), and the success command. It does not choose function names. The plan does that.

## Tests and the test environment

Automated tests and the live status-page check used by tests load `env.test` only. They never load `env.demo`. There is no file named `env`. If a variable the run needs is missing, the loader raises. It does not fill in a default database path.

`env.test` contains only:

```text
DESKCLERK_ENV=test
DESKCLERK_DB=var/test/deskclerk.sqlite
```

`env.demo` contains only:

```text
DESKCLERK_ENV=demo
DESKCLERK_DB=var/demo/deskclerk.sqlite
```

Both files are committed. They hold no secrets. `var/` is gitignored.

`scripts/activate_test_env.sh` creates nothing silently. It activates `.venv` if present, exports the variables from `env.test`, and fails if `DESKCLERK_ENV` is not `test`. Pytest's `conftest.py` calls the same loader and fails the session if `DESKCLERK_ENV` is not `test`. Integration tests open a temporary SQLite file. They do not open `var/demo/` or `var/test/`. The `DESKCLERK_DB` value in `env.test` is for a human test run. A test that needs a database creates its own file and passes that path in. This keeps tests from sharing a file.

A green run that loaded `env.demo` is a failed build, not a pass.

### Test-first, and explain the test

Every code change follows red, green, refactor, one behavior at a time. Do not write the whole suite first and then the implementation.

When a test is added, the implementer states, in the plan's Validation section for plan 001 and in the commit message body or the PR text for later work:

- the behavior, in plain language
- why the layer is unit or integration
- the exact pytest command
- what the red failure looked like before the code existed

Layers:

- `tests/unit/test_accept_line.py` calls `accept_line` with an in-memory SQLite connection. It covers accept, skip on second call, each failure class, update of the same failure identity, and delete of that failure when the same `ticket_id` later succeeds.
- `tests/integration/test_batch_and_status.py` runs the batch module on a temp copy of the sample file, asserts the printed counts, runs it again and asserts the second run skips the accepted tickets, then starts the status server on an ephemeral port and reads `GET /`.

A bug fix starts from a regression test that fails on the unfixed code.

The unit test for "second call skips" is the teaching example of an explanation:

> Behavior: a ticket id that is already accepted is not stored again. Layer: unit, because the rule is inside `accept_line` and does not need the CLI. Command: `source scripts/activate_test_env.sh && pytest tests/unit/test_accept_line.py::test_second_accept_skips -q`. Red: the assertion that the tickets table still has one row fails if the function inserts again.

Put that paragraph in plan 001's Validation section as the record of how the seed test was explained.

## Rules by kind of work

Shared method, then a short rule for the kind of system. Both live in `docs/references/agent-operating-policy.md` and are linked, not copied, from the every-turn files.

### Batch

- **Idempotent.** The same file twice does not create a second accepted ticket or a second failure row for the same identity.
- **Durable failure.** A failed unit is a row with a stable identity, not only a line of output.
- **Resume.** Tickets already in `tickets` are skipped. The run does not need a separate checkpoint file. The accepted row is the checkpoint.
- **Recovery without the chat.** A later invocation with a corrected line can accept a previously failed `ticket_id` because the identity is still in the database.

`docs/solutions/workflow-issues/accepted-row-is-the-checkpoint.md` is the seeded learning. It exists because a reader of the final `INSERT` might think a separate progress file is required. The lesson is that the primary key is the resume marker. That reasoning is not obvious from the insert alone.

### Status page

The page is the UI in this repo.

- Verify by starting `python -m deskclerk.web` against `env.demo` after a demo batch, and by the integration test against the test loader. The integration test is the repeatable check. The demo server is what a person clicks. Do not point a test at `env.demo`.
- Check the page with tickets present, with an empty database, and with at least one failure. A single look at the happy path is not enough.
- Look at a narrow window (about 375 pixels wide) and a desktop window (about 1200 pixels wide). The column must remain readable. Do not add a responsive framework to pass this.
- Pages that share state: this repo has one page. The rule to write down is: if a later plan adds a second page that reads the same database, both pages are checked.
- Do not add a component library. The existing UI is one HTML string in `web.py`.
- Before changing the markup to chase a visual symptom, check the counts in the database first. The first bad step may be the batch, not the HTML.

## Git as the system of record

Chat is not the archive. Do not keep `_old` files, backup copies, or commented-out previous versions. Commit after each coherent change. The message says why.

Do not commit secrets, databases, or `var/`.

Stay on the current branch unless the user asks for another. Do not push or merge unless the user asks, except through the gitsaver command below. Do not force-push the default branch. Do not skip hooks. Do not amend a commit that failed its hook, or a commit already pushed, unless the user asks. Stage named paths. Do not stage the whole tree with one blanket add.

Tags: after the commit that finishes plan 001, create `plan-001-accept-ticket-batch` as an annotated tag. Message: `Plan 001: accept a ticket batch and show counts`. Leave it local. Plan 002 gets a tag only when a trainee finishes it. Do not tag the docs-only commits that led up to the code unless they are the finishing commit.

`docs/references/git.md` documents three tools.

**Git time travel.** Use it when a regression needs a cause, lost work needs recovery, or a line needs its history. Bisect between a known-good and a known-bad commit with a deterministic test. A flaky test marks the wrong commit. Blame, and a history search for when a string appeared, answers why code exists. The reflog can recover a commit no branch points at, and it expires, which is why finished plans are tagged. Take a backup branch before a rebase. If a force push is required, use the form that refuses to overwrite unseen remote commits. If a rebase sticks, abort it.

**Gitsaver.** It runs only when someone types the command and a new branch name, for example `/gitsaver next-exercise`. The sentence "save my work" does not start it. Invoking it approves this sequence in the repository that contains the changes: classify files, commit named paths, push, open a pull request, squash-merge if checks allow, then create and push the named branch. It skips databases, `var/`, and secrets. It asks when a file is ambiguous. It stops on conflicts or a blocked merge. It does not commit on the default branch. In a repo with nested git repositories it asks which one to save. This training repo is a single repository, so that case is documentation only.

**Worktrees** are specified in the next section. Gitsaver moves the current checkout. A worktree is a second checkout. They are different tools.

## Maintaining the harness

The harness is what an agent loads before it edits: the three policy files, the docs they point at, and the skills installed on the machine. It rots by accumulation.

1. **Prune the every-turn files first.** After a few plans, or when a session spends its context re-reading policy, cut `CLAUDE.md`, `AGENTS.md`, and the Cursor rule back to the map in [Policy files for three agents](#policy-files-for-three-agents). If the same block exists in all three, keep one short sentence in each and put the procedure in one doc. Delete finished one-off instructions. Git history is the archive. Do not prune simplicity, the test-environment rule, the batch identity rule, three-way sync, test-first development, or one goal per plan.

2. **Update skills without losing local edits.** The update-skill workflow installs or upgrades skills from an upstream repository. It is not a blind overwrite. Skills live in a user copy per agent. A git backup, if the trainee keeps one, is the history those copies do not have. Do not write through a symlink that points at another copy. Classify each skill. New: install it and say which installed skill it overlaps. Unmodified: replace the folder. Customized: never replace the folder. Diff against the upstream version it started from, then wait for approval on each item: customizations to keep, bugs in the local copy, and upstream improvements worth taking. If upstream renamed a skill, say what replaces it. This training repo does not vendor skill bodies.

3. **Keep policy pointed at docs.** Nested guides hold local facts. The root file does not repeat them. `docs/references/harness-maintenance.md` holds this section's procedure so the every-turn files can link to it in one line.

## Code graph and worktrees

`docs/references/code-graph-and-worktrees.md` holds these rules.

A code knowledge graph answers how parts connect. The rule is map, then read. Query the graph, then read the files it names before an edit. Text search is the right tool for an exact error string or a known file. If the graph is not installed, use text search and reading. Do not make the tests or the demo depend on the graph. After code changes, update the graph if it is installed. The graph is not the concepts glossary.

A git worktree is a second working directory for this same repository, usually on another branch. It is useful for a risky experiment that must not disturb the current checkout. It is not the default. Do not create or switch a worktree unless the user asks, or approves one after you explain why isolation would help. Do not infer approval from the kind of task. The first build does not create a worktree.

## Sibling systems

This repository is one git repo. The lesson about sibling systems is a document plus a fixture, not a second implementation.

`docs/architecture/sibling-producer-contract.md` says:

- A producer, outside this repo, writes the JSON Lines file.
- Desk Clerk only reads that file and stores results. It does not fetch tickets from the network and it does not repair the producer's files in place.
- The shared surface is the three fields and the JSON Lines encoding, as defined in [Example application](#example-application).
- A bad line is a failure row here. The fix for a systematic bad export belongs in the producer. Do not relax `ticket_id` to accept whatever the producer emitted.
- `samples/tickets.jsonl` is a committed fixture standing in for that producer. It is not a second package.

If a class later wants a real second repository, that is a new ExecPlan. Do not create it in the first build.

## What to check in on the first implementation

Check in the layout in [Repository layout](#repository-layout), the behavior in [Example application](#example-application), the policy map, `PLANS.md`, the docs named in this spec, the sample file, both env files, the tests, and the plan 001 tag.

Also check in:

- `docs/ideation/2026-10-05-desk-clerk-first-slice-ideation.md`
- `docs/brainstorms/2026-10-05-accept-ticket-batch-requirements.md`
- `docs/plans/2026-10-05-001-accept-ticket-batch-plan.md` with every living section filled, including the test explanation paragraph
- `docs/plans/2026-10-05-002-show-failure-detail-on-status-page-plan.md` with open Progress boxes and no code for that goal
- `.gitignore` including `.venv/`, `var/`, `__pycache__/`, `.pytest_cache/`

Plan 001's Concrete Steps use the repository root as the working directory. Plan 002's Validation says the new assertion is that the failure `detail` text appears in `GET /`, and that this test fails before the HTML change.

Do not check in a database file, a virtualenv, or a second copy of this spec.

## How a training session uses the repo

A session can run in four parts. The repo does not automate them.

1. Read the precedence in `CLAUDE.md` or `AGENTS.md`, then `docs/references/CONCEPTS.md`. The point is that simplicity outranks ceremony, and that the glossary is the shared language.
2. Walk plan 001 from requirements to the checked Progress boxes to the test that fails when a ticket is inserted twice. Run `source scripts/activate_test_env.sh && pytest`. Open the demo page only after a demo batch, and say out loud that the demo file is not the test file.
3. Implement plan 002. Write the failing integration assertion first. Explain it. Then change `web.py` only. Do not add a column to SQLite. `detail` is already stored.
4. Review the diff against plan 002. Decide whether a solution note is earned. A note that only says "we showed the detail column" is not earned, because the HTML shows that. A note is earned only if the session discovered something the code will not teach.

The facilitator rejects, in front of the class, any proposed change that adds a framework, a new failure class, or a worktree for plan 002. That rejection is the simplicity lesson.

## Build order

Build in this order so each step is checkable. Follow test-first for the application code. Write the failing test named in the step before the production code for that step.

1. Create the repository, `pyproject.toml`, `.gitignore`, `env.test`, `env.demo`, and `scripts/activate_test_env.sh`. Acceptance: the activate script prints `DESKCLERK_ENV=test` and a second command that sources `env.demo` is not used by pytest.
2. Write `src/deskclerk/env.py` and a unit test that a missing variable raises, and that loading `env.test` yields `DESKCLERK_ENV=test`.
3. Write the failing unit tests for `accept_line`, including the explanation paragraph in the plan as you write plan 001. Then implement `batch_helpers/accept.py` until those tests pass. Then add `batch.py` and the sample file.
4. Write the failing integration test for a second batch run and for `GET /`. Then implement the parts that are still missing.
5. Write the docs tree, policy files, `PLANS.md`, and plan 002. Keep the every-turn files short.
6. Commit in coherent steps. Tag the commit that completes plan 001.
7. Run the acceptance list below from a clean shell.

Do not implement plan 002 in this build.

## Acceptance

From the repository root, with no demo database present:

- `source scripts/activate_test_env.sh && pytest` passes.
- `pytest` without that script fails, because `DESKCLERK_ENV` is unset or is not `test`.
- `python -m deskclerk.batch --input samples/tickets.jsonl` after activating `env.demo` prints `accepted=2 skipped=0 failed=2` the first time, and `accepted=0 skipped=2 failed=2` the second time. The failed count stays 2 because the two bad lines are still bad. The accepted count does not become 4.
- `GET /` on the demo server shows accepted 2 and failed 2, and lists the two failure identities.
- An empty database shows accepted 0 and failed 0 without an error page.
- `rg` over the repository finds no dependency on a web framework, an ORM, or a network client.
- `CLAUDE.md`, `AGENTS.md`, and the Cursor rule all state the same precedence, and none of them contains the full batch contract. That contract is in `docs/architecture/batch-contract.md`.
- Plan 001 has all twelve sections, checked progress, and the test-explanation paragraph.
- Plan 002 has open progress boxes and no matching implementation of failure `detail` in the HTML.
- The tag `plan-001-accept-ticket-batch` points at the finishing commit.
- Nothing in the tree names another product or copies another project's source.

## Out of scope

- A web form, authentication, or a second page
- More failure classes, retries with backoff, or a job queue
- Cleaning up `line-N` failures automatically
- A second repository for the producer
- Vendored skills, a code-graph install step, or a created worktree
- Implementing plan 002
- Any data, name, or file taken from a private project
