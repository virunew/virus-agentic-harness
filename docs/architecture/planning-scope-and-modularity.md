# Planning Scope And Modularity

## TOC

- [Purpose](#purpose)
- [One goal](#one-goal)
- [Deep modules](#deep-modules)
- [Once and only once](#once-and-only-once)
- [Where helpers go](#where-helpers-go)
- [File size](#file-size)
- [What modularity does not allow](#what-modularity-does-not-allow)

## Purpose

This note is the standing style for plans and for how Desk Clerk code is shaped. The every-turn files point here. They do not restate this page.

## One goal

One easily achievable goal per plan. A shippable slice is one a person can watch end to end.

If a draft has two outcomes that could ship separately, stop and ask to split. Do not fold a second product into the plan to be thorough. Signs of a split: more than one outcome a person could use alone, or a milestone list that cannot be checked until unrelated pieces land.

Plan files follow [PLANS.md](../../PLANS.md). The id in `docs/plans/YYYY-MM-DD-NNN-slug-plan.md` is unique across that tree.

## Deep modules

A deep module hides a real behavior behind a small interface. The caller does not assemble the steps.

The good example in this repository is `accept_line` in `src/deskclerk/batch_helpers/accept.py`:

```text
accept_line(conn, line_number, line) -> "accepted" | "skipped" | "failed"
```

One call parses the line, chooses one of the three failure classes, inserts or skips the ticket, and upserts or deletes the failure row. `src/deskclerk/batch.py` opens the database, walks the lines, and prints the counts. It does not contain those rules.

The bad example is a chain of one-function files the caller must run in order:

```text
payload = parse_line(line)
kind = classify(payload)
write_ticket(conn, kind)
write_failure(conn, kind)
```

That chain makes the caller the real module. Named functions inside `accept.py` are fine. A file that only forwards to another function is a mistake. Do not split a module only to cut its line count.

## Once and only once

A behavior lives in one place. Every path that needs it calls that place.

Apply this to the change you are already making. It is not permission to hunt the tree for unrelated copies.

## Where helpers go

Helpers for one command live in a folder beside that command, named `{script_stem}_helpers`. Desk Clerk uses `src/deskclerk/batch_helpers/` for the batch command. Do not add a shared `helpers/` pile, and do not add one file per function.

`src/deskclerk/env.py` is separate because choosing a file is not an acceptance rule. It still has no default path.

## File size

Keep the command file on orchestration. A deep helper may be longer than the command. Split a helper only when it mixes unrelated jobs, not because a line count was crossed.

## What modularity does not allow

Modularity shapes the code that was requested. It does not authorize an extra feature, a new failure class, a second page, or a refactor of files the task does not need.

Minimal change limits what you build. Deep modules govern the boundary of that build. Once and only once means one implementation of a repeated behavior inside that build.
