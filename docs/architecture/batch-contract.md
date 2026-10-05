# Batch Contract

## TOC

- [Purpose](#purpose)
- [Idempotence](#idempotence)
- [Failure identity](#failure-identity)
- [Resume](#resume)
- [What a re-run prints](#what-a-re-run-prints)

## Purpose

This page is the contract for `python -m deskclerk.batch`. The code and the tests match it. The every-turn files do not copy it.

A batch run is one invocation on one UTF-8 JSON Lines file. It does not have to be the first run.

## Idempotence

The same file twice does not create a second accepted ticket. It does not create a second failure row for the same identity.

A valid line whose `ticket_id` is already in `tickets` is a skip. The stored `desk`, `body`, and `accepted_at` stay as they were.

An invalid line is a durable failure. The rest of the file still runs. The only failure classes are:

- `unreadable_line` when the line is not a JSON object
- `invalid_id` when `ticket_id` is missing or does not match `^[a-z0-9-]{1,40}$`
- `invalid_ticket` when `desk` or `body` is missing, empty, or too long

`desk` is at most 40 characters. `body` is at most 500 characters. Both must be non-empty strings when the line is accepted.

## Failure identity

A failure row is identified by `failure_class`, the program name `deskclerk.batch`, and `ticket_id`. Re-running the same failure updates that row.

For `unreadable_line` there is no ticket id, so `ticket_id` is the 1-based line number with the prefix `line-`, for example `line-4`. When `ticket_id` is missing or not a string, `invalid_id` uses that same `line-N` form because there is no string to store. A present but illegal id is stored as the text that was read.

If a previously failed `ticket_id` is valid on a later run, the clerk accepts it and deletes failure rows for that `ticket_id`. Line-numbered unreadable failures are not auto-deleted. A later edit can shift line numbers. The status page shows those rows until a person removes the SQLite file, or until a later plan defines a cleanup. This build does not invent that cleanup.

## Resume

Tickets already in `tickets` are skipped. There is no separate checkpoint file. The accepted row is the checkpoint. A later invocation with a corrected line can accept a previously failed `ticket_id` because that identity is still in the database.

## What a re-run prints

The command prints three integers: accepted, skipped, failed.

On `samples/tickets.jsonl`, against an empty database, the first run prints:

```text
accepted=2 skipped=0 failed=2
```

The second run prints:

```text
accepted=0 skipped=2 failed=2
```

The failed count stays 2 because the two bad lines are still bad. The accepted count does not become 4.
