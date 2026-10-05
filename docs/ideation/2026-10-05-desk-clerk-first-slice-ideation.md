# Desk Clerk First Slice

## TOC

- [Question](#question)
- [Ideas](#ideas)
- [What survives](#what-survives)

## Question

Which first slice is worth building so a class can watch one agentic coding method on a tiny application?

## Ideas

1. Accept a JSON Lines file into SQLite and show counts.
2. A web form that creates tickets.
3. A plugin system for desks.

## What survives

Keep the first idea. A person can run one command, see accepted and failed counts, and run it again without duplicating tickets. That is enough to teach the plan, the test environment, and a durable failure row.

Reject a web form that creates tickets. It is a second product, and the status page is a view, not an editor.

Reject a plugin system for desks. It adds a framework the first slice does not need.
