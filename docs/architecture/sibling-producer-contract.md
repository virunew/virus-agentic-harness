# Sibling Producer Contract

## TOC

- [Purpose](#purpose)
- [Who writes, who reads](#who-writes-who-reads)
- [The shared surface](#the-shared-surface)
- [What Desk Clerk does not do](#what-desk-clerk-does-not-do)
- [The fixture](#the-fixture)

## Purpose

Desk Clerk is one git repository. The lesson about a sibling system is this document plus a fixture. The first build does not create a second repository.

A producer, outside this repo, writes the JSON Lines file. Desk Clerk only reads that file and stores results.

## Who writes, who reads

The producer acquires or exports tickets. Desk Clerk accepts the valid ones and records the bad lines. Mixing those jobs is how a reader starts "fixing" the export by weakening the clerk.

If a class later wants a real second repository, that is a new ExecPlan.

## The shared surface

The shared surface is the three fields and the JSON Lines encoding:

- `ticket_id`: a string matching `^[a-z0-9-]{1,40}$`
- `desk`: a non-empty string of at most 40 characters
- `body`: a non-empty string of at most 500 characters

One JSON object per non-empty line, UTF-8. The two sides do not share a database, a package, or a process.

## What Desk Clerk does not do

- It does not fetch tickets from the network.
- It does not repair the producer's files in place.
- A bad line is a failure row here. The fix for a systematic bad export belongs in the producer.
- Do not relax `ticket_id` to accept whatever the producer emitted. A wider pattern would store ids the rest of the ledger cannot treat as stable keys.

## The fixture

`samples/tickets.jsonl` is a committed fixture standing in for that producer. It has two valid tickets, one invalid id, and one empty body. It is not a second package, and it contains no personal data.
