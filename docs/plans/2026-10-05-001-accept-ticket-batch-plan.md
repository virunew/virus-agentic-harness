# Accept a ticket batch and show counts

This ExecPlan is a living document. It is governed by `PLANS.md` at the repository root.

Plan ID: 001

## Purpose / Big Picture

After this plan, a person can run Desk Clerk on a JSON Lines file of tickets. Valid tickets are stored once. Invalid lines are remembered as rows. Running the same file again skips the tickets already stored and does not add a second copy. A one-page status view shows the accepted count, the failed count, and the current failure identities.

Means: the approach is fixed. See the Decision Log. JSON Lines, one SQLite file, three failure classes, and a standard-library page.

A person sees it by running the batch twice from the repository root and opening `http://127.0.0.1:8765/`.

## Progress

- [x] (2026-10-05 15:20Z) Test environment loads `env.test` only, and a missing variable raises.
- [x] (2026-10-05 15:30Z) `accept_line` accepts, skips, records the three failure classes, updates one failure identity, and deletes that failure when the same id later succeeds.
- [x] (2026-10-05 15:40Z) `python -m deskclerk.batch` prints the three counts, and the second run skips accepted tickets.
- [x] (2026-10-05 15:45Z) `GET /` shows accepted and failed counts and the failure identities, including an empty database.
- [x] (2026-10-05 15:50Z) The page was opened at about 375 pixels and about 1200 pixels.

## Surprises & Discoveries

- Observation: the second call to `accept_line` did not reach the "one row" assertion. It raised before that.
  Evidence: `pytest tests/unit/test_accept_line.py::test_second_accept_skips -q` failed with `sqlite3.IntegrityError: UNIQUE constraint failed: tickets.ticket_id`.
- Observation: a JSON array is valid JSON and still not a ticket.
  Evidence: `accept_line` on `[1, 2, 3]` raised `TypeError: list indices must be integers or slices, not str` until non-objects were classed as `unreadable_line`.
- Observation: `word-break: break-word` split `deskclerk.batch` in the middle of a word at 375 pixels.
  Evidence: the narrow page showed `deskclerk.batc` and `h` on separate lines. The same style block now stacks each failure under 40rem, and the desktop width stays a table.

## Decision Log

- Decision: the input is one JSON Lines file, not a directory of ticket files.
  Rationale: one file is the whole batch, and a line number can identify an unreadable line.
  Date: 2026-10-05
- Decision: one SQLite file, not a hand-rolled file per ticket.
  Rationale: a unique key makes the re-run an update, which a pile of JSON files does not. See `docs/solutions/architecture-decisions/sqlite-ledger-not-json-files.md`.
  Date: 2026-10-05
- Decision: three failure classes and no more. They are `unreadable_line`, `invalid_id`, and `invalid_ticket`.
  Rationale: those three cover a bad line, a bad id, and a bad desk or body. More classes would be a new product decision.
  Date: 2026-10-05
- Decision: the status page is HTML from the standard library, not a web framework.
  Rationale: the page is one column and one table. A framework would be a second system for a view that only reads the database.
  Date: 2026-10-05
- Decision: an accepted row deletes failure rows for that `ticket_id` only. `line-N` unreadable rows stay.
  Rationale: a corrected ticket can be resumed from the database. A line number is not a ticket id, and editing the file can move it.
  Date: 2026-10-05

## Outcomes & Retrospective

The purpose is met. The first demo run prints `accepted=2 skipped=0 failed=2`. The second prints `accepted=0 skipped=2 failed=2`. `GET /` shows accepted 2, failed 2, and the two identities `invalid_id` / `NOT VALID` and `invalid_ticket` / `note-3`. An empty database shows accepted 0 and failed 0.

A trainee should notice three things. The plan was the memory: the failure classes, the skip rule, and the page contract were written here, not left in the chat. The tests were the proof: `test_second_accept_skips` fails if a ticket is inserted twice, and the integration test fails if the second batch run does not skip. No second storage engine was added. SQLite is the ledger.

Plan 002, showing failure `detail` on the page, is deliberately not done.

## Context and Orientation

Desk Clerk is a local command and a one-page view. The package is `src/deskclerk/`.

`src/deskclerk/batch.py` is the command `python -m deskclerk.batch`. It reads `--input`, opens the SQLite file named by `DESKCLERK_DB`, and prints three counts. It does not decide whether a line is valid.

`src/deskclerk/batch_helpers/accept.py` holds `accept_line`. That function returns `accepted`, `skipped`, or `failed`.

`src/deskclerk/web.py` is `python -m deskclerk.web`. It reads the same database and writes one HTML page. It does not import a web framework.

`src/deskclerk/env.py` loads an environment file the caller names. It has no default path.

`samples/tickets.jsonl` has four lines: tickets `lamp-1` and `parcel-2`, an id `NOT VALID`, and ticket `note-3` with an empty body.

`tickets` stores `ticket_id`, `desk`, `body`, and `accepted_at`. `failures` stores `failure_class`, `program`, `ticket_id`, `detail`, and `updated_at`. The failure primary key is `(failure_class, program, ticket_id)`. The program name is `deskclerk.batch`.

A ticket is a row in `tickets`. A failure is a row in `failures`. They are not the same thing.

## Plan of Work

`tests/unit/test_env.py` calls `load_env`. A file that omits `DESKCLERK_DB` must raise. Loading `env.test` must yield `DESKCLERK_ENV=test`. `src/deskclerk/env.py` implements that and does not choose a path on its own.

`tests/unit/test_accept_line.py` calls `accept_line` on an in-memory connection, one behavior at a time. `src/deskclerk/batch_helpers/accept.py` creates the two tables, parses the line, and writes. A valid new id inserts. The same id uses `ON CONFLICT DO NOTHING` and returns `skipped` without changing the stored row. An unreadable line, a bad id, and a bad desk or body upsert one failure. A later valid line for that id deletes the failure rows for that id.

`samples/tickets.jsonl` is the committed fixture. `tests/integration/test_batch_and_status.py` copies it to a temporary directory, points `DESKCLERK_DB` at a temporary SQLite file, runs the batch module twice, and then starts `deskclerk.web` on an ephemeral port and reads `GET /`.

`src/deskclerk/web.py` renders accepted count, failed count, and a table of `failure_class`, `program`, and `ticket_id`. It does not render `detail`. That is plan 002.

## Concrete Steps

Working directory: the repository root.

```text
source scripts/activate_test_env.sh && pytest
```

Expected: the run passes. On the finished tree that was 13 passed.

Demo, after `pip install -e .` into `.venv`, with no demo database present:

```text
source .venv/bin/activate
set -a && source env.demo && set +a
python -m deskclerk.batch --input samples/tickets.jsonl
python -m deskclerk.batch --input samples/tickets.jsonl
python -m deskclerk.web --port 8765
```

Expected transcript from the two batch runs:

```text
accepted=2 skipped=0 failed=2
accepted=0 skipped=2 failed=2
```

Opening `http://127.0.0.1:8765/` shows Accepted 2, Failed 2, and the two failure identities.

## Validation and Acceptance

Behavior: a ticket id that is already accepted is not stored again. Layer: unit, because the rule is inside `accept_line` and does not need the CLI. Command: `source scripts/activate_test_env.sh && pytest tests/unit/test_accept_line.py::test_second_accept_skips -q`. Red: the assertion that the tickets table still has one row fails if the function inserts again.

The other unit tests cover a first accept, each failure class, an update of the same failure identity, and deletion of that failure when the same `ticket_id` later succeeds. They call `accept_line` in memory.

The integration test runs the batch on a temp copy of the sample, expects `accepted=2 skipped=0 failed=2`, runs it again, expects `accepted=0 skipped=2 failed=2`, then reads `GET /` and expects Accepted 2, Failed 2, and both failure identities. It also reads an empty database and expects Accepted 0 and Failed 0. The command is `source scripts/activate_test_env.sh && pytest tests/integration/test_batch_and_status.py -q`. Before `batch.py` existed, that test failed with `No module named deskclerk.batch`.

Pytest without the activate script must fail because `DESKCLERK_ENV` is unset or is not `test`.

## Idempotence and Recovery

Running the batch on the same file again is safe. Accepted tickets stay one row. Failure identities stay one row. To start the demo over, stop the server and remove `var/demo/`. Do not delete `env.demo` or the sample file. Tests do not need that reset. Each test builds its own database.

If a run stops halfway through a file, the rows already committed stay. Run the same command again. Completed tickets are skipped. The file does not start over in the sense of redoing that work.

## Artifacts and Notes

```text
accepted=2 skipped=0 failed=2
accepted=0 skipped=2 failed=2
```

`GET /` includes `Accepted 2`, `Failed 2`, `invalid_id`, `invalid_ticket`, `NOT VALID`, and `note-3`. It does not include the failure detail `body is empty`.

## Interfaces and Dependencies

Dependencies are pytest only, declared in `pyproject.toml`. The page uses `http.server` from the standard library. Storage uses `sqlite3` from the standard library. Do not add a web framework, an ORM, or a CLI framework.

At the end of this plan these exist:

- `load_env(path) -> dict` in `src/deskclerk/env.py`. It raises when `DESKCLERK_ENV` or `DESKCLERK_DB` is missing. It has no default path.
- `accept_line(conn, line_number, line) -> "accepted" | "skipped" | "failed"` in `src/deskclerk/batch_helpers/accept.py`.
- `python -m deskclerk.batch --input <file>` reads `DESKCLERK_DB` and prints the three counts.
- `python -m deskclerk.web --port 8765` serves `GET /` from that same database.

## Revision note

2026-10-05: wrote this file as the finished example after the batch command and the status page were checked. The phone-width layout note was added because the first narrow view broke a word in the program name.
