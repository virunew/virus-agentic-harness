# Concepts

## TOC

- [Purpose](#purpose)
- [Ticket words](#ticket-words)
- [Run words](#run-words)
- [Method words](#method-words)
- [What this glossary is not](#what-this-glossary-is-not)

## Purpose

This glossary is the shared language for Desk Clerk. Later plans use these words with these meanings. Each ExecPlan still defines any term it uses, so a cold agent can read the plan without this file. The glossary stops those definitions from drifting apart.

The public discussion of ontology in 2026 says agents need a canonical model of the domain: the objects, the relationships, and the invariants, not only a chat glossary. Knowledge-layer writing splits that into what the words mean, what is true in the data now, and what was learned. This training repository does the first part on purpose. It does not build a formal schema language, a graph database, or a runtime that blocks illegal agent actions.

## Ticket words

**Ticket.** One desk item identified by `ticket_id`. It is not a failure row.

**Accepted ticket.** A row in `tickets`. Acceptance is idempotent. A second sighting of the same id is a skip, not a second ticket.

**Failure.** A row in `failures`. It is not a log line. The same identity updates one row.

**Line failure.** An `unreadable_line` keyed by `line-N`. It is not a ticket id. Fixing a later line does not silently clear it.

## Run words

**Batch run.** One invocation of `python -m deskclerk.batch` on one file. It is not required to be the first run. Completed tickets are skipped.

**Status page.** The HTML view of current counts and failure identities. It is not an editor. It does not accept tickets.

**Test environment.** The process loaded from `env.test`. It is not the demo database under `var/demo/`.

**Demo environment.** The process loaded from `env.demo` for a person clicking the page. Tests must not load it.

## Method words

**ExecPlan.** A living plan file governed by `PLANS.md`. It is not a requirements note and not a chat summary.

**Simplicity.** The smallest readable change that does what was asked. It is not a reason to skip the test environment or to duplicate accepted tickets.

## What this glossary is not

The code graph maps functions to files. It is not this glossary. Do not merge them.

Domain design for the batch lives in [docs/architecture/batch-contract.md](../architecture/batch-contract.md). Settled choices live in [docs/solutions/](../solutions/).
