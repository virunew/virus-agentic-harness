# Show failure detail on the status page

This ExecPlan is a living document. It is governed by `PLANS.md` at the repository root.

Plan ID: 002

This plan is class work. Do not implement it as part of the first build of the repository.

## Purpose / Big Picture

After this plan, a person opening the status page can read the `detail` text for each current failure, not only the failure identity. The identity stays visible. The detail says why that row failed, for example that a body is empty.

Means: `detail` is already a column on `failures`. The change is the HTML in `src/deskclerk/web.py`, plus the assertion that proves the text is on the page. See the Decision Log.

A person sees it by running a demo batch that still has bad lines, opening `http://127.0.0.1:8765/`, and reading the detail next to each identity.

## Progress

- [ ] (unstarted) Add a failing integration assertion that the failure `detail` text appears in `GET /`.
- [ ] (unstarted) Change the status page HTML so that text is rendered.
- [ ] (unstarted) Re-run the test environment and open the page at a narrow width and a desktop width, including the empty database and a database that has a failure.

## Surprises & Discoveries

None yet. This plan has not been implemented.

## Decision Log

- Decision: do not add a column to SQLite.
  Rationale: `failures.detail` is already stored by `accept_line`. The page is the only gap.
  Date: 2026-10-05
- Decision: do not add a failure class, a web framework, or a worktree for this plan.
  Rationale: the observable change is one column of text that is already in the database. Those additions are extra products.
  Date: 2026-10-05

## Outcomes & Retrospective

Not started. There is no result to compare with the purpose yet. A note that only says "we showed the detail column" will not be earned when this plan finishes, because the HTML will show that. Write a solution note only if the session discovers something the code will not teach.

## Context and Orientation

Plan 001 is done. `python -m deskclerk.batch` stores a `detail` string on each failure row. `src/deskclerk/web.py` reads `failure_class`, `program`, and `ticket_id` only. `GET /` therefore lists identities and does not show `detail`.

The sample file `samples/tickets.jsonl` produces two failures. The empty-body line is ticket `note-3`. Its stored detail is `body is empty`. The bad id `NOT VALID` has its own detail about the id pattern. Neither string is rendered today. The integration test even asserts that `body is empty` is absent, so plan 001's page stays free of detail.

A failure is one row in `failures`. Detail is the text column on that row. It is not a new table and not a log line.

The status page is the HTML view. It is not an editor.

## Plan of Work

Edit `tests/integration/test_batch_and_status.py` first. The test that already reads `GET /` after the sample batch currently asserts that `body is empty` is absent, so plan 001's page does not show detail. Replace that absence check with an assertion that the failure detail text appears in the response. Use `body is empty`. Run that test and watch it fail before changing the HTML.

Then change `render_page` in `src/deskclerk/web.py` so the table includes `detail` for each failure. Select that column in the existing read. Escape it like the other cells. Do not add a stylesheet framework. Keep one column of content that is readable at about 375 pixels and about 1200 pixels.

Do not change `batch_helpers/accept.py` unless a test shows the detail was never stored. Do not add a SQLite column. Do not add a second page.

## Concrete Steps

Working directory: the repository root.

Write the failing assertion, then run:

```text
source scripts/activate_test_env.sh && pytest tests/integration/test_batch_and_status.py -q
```

Expected before the HTML change: the new assertion fails because `GET /` does not contain the detail text.

After `web.py` renders `detail`, the same command passes. Then load `env.demo`, run the batch if the demo database is empty, and open `python -m deskclerk.web --port 8765`.

## Validation and Acceptance

The new assertion is that the failure `detail` text appears in `GET /`, and that this test fails before the HTML change.

Behavior: each failure on the status page shows its stored detail, not only `failure_class`, `program`, and `ticket_id`. Layer: integration, because the proof is the HTML the server returns, not the row that `accept_line` already writes. Command: `source scripts/activate_test_env.sh && pytest tests/integration/test_batch_and_status.py -q`. Red: the assertion that the detail text is in the response body fails while `web.py` still omits `detail`.

Also open the page with tickets present, with an empty database, and with at least one failure, at about 375 pixels wide and about 1200 pixels wide.

## Idempotence and Recovery

Changing the HTML does not rewrite tickets. Re-running the tests is safe. If the markup is wrong, restore `web.py` from git and leave the database alone. Do not delete `failures.detail`. There is no migration to roll back.

## Artifacts and Notes

No success transcript yet. The page that proves success includes the detail text, for example `body is empty`, next to the `note-3` failure identity.

## Interfaces and Dependencies

No new library. `render_page` in `src/deskclerk/web.py` must include the `detail` column already defined on `failures`. `accept_line` keeps the signature from plan 001:

```text
accept_line(conn, line_number, line) -> "accepted" | "skipped" | "failed"
```

## Revision note

2026-10-05: wrote this plan as unstarted class work. No code for this goal is in the first build.
