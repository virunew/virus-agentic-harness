# Harness Maintenance

## TOC

- [Purpose](#purpose)
- [Prune the every-turn files first](#prune-the-every-turn-files-first)
- [Update skills without losing local edits](#update-skills-without-losing-local-edits)
- [Keep policy pointed at docs](#keep-policy-pointed-at-docs)

## Purpose

The harness is what an agent loads before it edits: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/core-rules/agent-policy.mdc`, the docs they point at, and the skills installed on the machine. It rots by accumulation. This page is the procedure, so the every-turn files can link to it in one line.

## Prune the every-turn files first

After a few plans, or when a session spends its context re-reading policy, cut `CLAUDE.md`, `AGENTS.md`, and the Cursor rule back to the map in the bootstrap spec: one sentence on Desk Clerk and the nearest nested guide, the precedence block, the pointers, the test command, the one-goal plan rule, the batch sentence, the status-page sentence, the git sentence, and the harness sentence.

If the same block exists in all three, keep one short sentence in each and put the procedure in one doc. Delete finished one-off instructions. Git history is the archive.

Do not prune simplicity, the test-environment rule, the batch identity rule, three-way sync, test-first development, or one goal per plan.

A change to a rule is copied into all three files in the same change.

## Update skills without losing local edits

The update-skill workflow installs or upgrades skills from an upstream repository. It is not a blind overwrite. Skills live in a user copy per agent. A git backup, if the trainee keeps one, is the history those copies do not have. Do not write through a symlink that points at another copy.

Classify each skill.

- New: install it and say which installed skill it overlaps.
- Unmodified: replace the folder.
- Customized: never replace the folder. Diff against the upstream version it started from, then wait for approval on each item: customizations to keep, bugs in the local copy, and upstream improvements worth taking.

If upstream renamed a skill, say what replaces it. This training repo does not vendor skill bodies. Skills such as ideate, brainstorm, plan, document review, vet, work, code review, and compound stay installed on the trainee's machine.

## Keep policy pointed at docs

Nested guides hold local facts. `src/deskclerk/CLAUDE.md` only says where batch orchestration, acceptance rules, and the environment loader live. The root file does not repeat that paragraph.

When a procedure grows, move it into `docs/` and leave a link.
