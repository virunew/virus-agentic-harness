# Testing

## TOC

- [Purpose](#purpose)
- [Layout](#layout)
- [How to run](#how-to-run)
- [What each layer proves](#what-each-layer-proves)
- [Explaining a test](#explaining-a-test)

## Purpose

Tests prove Desk Clerk behavior. They load the test environment only. Layout and names stay small because the application is small.

## Layout

```text
tests/
├── conftest.py
├── unit/
│   ├── test_env.py
│   └── test_accept_line.py
└── integration/
    └── test_batch_and_status.py
```

Name a file `test_<module>.py`. A regression for a bug belongs in the file that already owns that behavior, unless the bug needs the full command.

## How to run

From the repository root:

```bash
source scripts/activate_test_env.sh && pytest
```

`conftest.py` calls `load_env` on `env.test` and fails the session when `DESKCLERK_ENV` is not `test`. Pytest without the activate script fails because the variable is unset or is not `test`.

Integration tests create their own SQLite file in a temporary directory and pass that path in. They do not open `var/demo/` or `var/test/`. The `DESKCLERK_DB` value in `env.test` is for a human test run.

There is no third-party web framework, ORM, or network client to mock. Do not add one so a test can avoid the real command.

## What each layer proves

Unit tests call `accept_line` with an in-memory connection. Use them when the rule is inside that function and does not need the CLI. They cover accept, skip on the second call, each failure class, update of the same failure identity, and delete of that failure when the same `ticket_id` later succeeds.

Integration tests run `python -m deskclerk.batch` on a temp copy of `samples/tickets.jsonl`, assert the printed counts, run it again, and then read `GET /` from the status server on an ephemeral port. Use them when the proof is the command and the page together.

A bug fix starts from a regression test that fails on the unfixed code.

## Explaining a test

When a test is added, say:

- the behavior, in plain language
- why the layer is unit or integration
- the exact pytest command
- what the red failure looked like before the code existed

The teaching example is in plan 001's Validation section, for `test_second_accept_skips`.
