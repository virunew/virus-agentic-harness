# Accept A Ticket Batch

## TOC

- [Outcome](#outcome)
- [Behavior](#behavior)
- [Non-goals](#non-goals)
- [Success command](#success-command)

## Outcome

A person can hand Desk Clerk a file of tickets. Valid tickets are kept. Invalid lines are remembered. The same file can be run again without duplicating the tickets that already landed. A single page shows the current counts and which failures are still on record.

This note states what someone can observe. It does not choose function names or a module layout. The plan does that.

## Behavior

The input is a UTF-8 JSON Lines file. Each non-empty line is one JSON object with `ticket_id`, `desk`, and `body`. A valid line is stored once per `ticket_id`. The same id on a later run is skipped, and the stored row is left unchanged.

An invalid line does not stop the file. It is remembered under one of three failure classes: the line is not a JSON object, the id is missing or illegal, or `desk` or `body` is missing, empty, or too long. The same failure updates one row. A later valid line for an id that previously failed accepts that ticket and clears the failure rows for that id. A failure that only has a line number is not cleared by a later successful ticket, because line numbers move when the file is edited.

The command prints how many lines were accepted, skipped, and failed.

The page shows the accepted count, the failed count, and the list of current failure identities. It does not show a skipped-on-last-run count.

## Non-goals

- No web form that creates tickets.
- No plugin system for desks.
- No automatic cleanup of line-numbered unreadable failures.
- No second storage engine.
- No editor on the status page.

## Success command

From the repository root, on an empty database, with the demo environment loaded and `samples/tickets.jsonl` as the input:

```text
python -m deskclerk.batch --input samples/tickets.jsonl
accepted=2 skipped=0 failed=2
```

A second run prints `accepted=0 skipped=2 failed=2`. Opening the status page shows accepted 2, failed 2, and the two failure identities.
