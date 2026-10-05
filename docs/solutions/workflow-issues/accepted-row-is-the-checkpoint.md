# The Accepted Row Is The Checkpoint

## TOC

- [What happened](#what-happened)
- [Lesson](#lesson)
- [Why the code does not say it](#why-the-code-does-not-say-it)

## What happened

The first batch design needed a way to resume. A reader of the final `INSERT` can think a separate progress file is required: something that remembers which lines were already handled so the next run can skip them.

## Lesson

The primary key on `tickets.ticket_id` is the resume marker. A later run tries to insert. When the key is already there, the line is a skip and the stored row stays as it was. Failures use their own primary key, so the same identity updates one row instead of appending a log.

There is no checkpoint file beside the database.

## Why the code does not say it

The insert, the conflict clause, and the skip return value show the mechanism. They do not say why a second file would be the wrong resume marker. That is why this note exists. The contract is [docs/architecture/batch-contract.md](../../architecture/batch-contract.md).
