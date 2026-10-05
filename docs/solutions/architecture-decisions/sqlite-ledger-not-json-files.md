# SQLite Ledger, Not JSON Files

## TOC

- [Decision](#decision)
- [Rejected alternative](#rejected-alternative)
- [Rationale](#rationale)

## Decision

Desk Clerk stores accepted tickets and failures in one SQLite file.

Date: 2026-10-05.

## Rejected alternative

A JSON file per ticket.

## Rationale

A unique key makes the re-run an update, which a pile of JSON files does not.
