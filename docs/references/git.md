# Git

## TOC

- [Purpose](#purpose)
- [What gets committed](#what-gets-committed)
- [Tags](#tags)
- [Git time travel](#git-time-travel)
- [Gitsaver](#gitsaver)
- [Worktrees are a different tool](#worktrees-are-a-different-tool)

## Purpose

Chat is not the archive. Git history is. This page documents three tools an agent may use in Desk Clerk: time travel, gitsaver, and worktrees. The worktree rule itself is in [code-graph-and-worktrees.md](code-graph-and-worktrees.md).

## What gets committed

Commit after each coherent change. The message says why. Stage named paths. Do not stage the whole tree with one blanket add.

Do not commit secrets, databases, or `var/`. Do not keep `_old` files, backup copies, or commented-out previous versions.

Stay on the current branch unless the user asks for another. Do not push or merge unless the user asks, except through the gitsaver command below. Do not force-push the default branch. Do not skip hooks. Do not amend a commit that failed its hook, or a commit already pushed, unless the user asks.

## Tags

After the commit that finishes a plan, create a local annotated tag `plan-NNN-short-name`. Ordinary commits are not tagged. Do not push the tag unless the user asks.

Plan 001's tag is `plan-001-accept-ticket-batch`. The message is `Plan 001: accept a ticket batch and show counts`. Plan 002 gets a tag only when a trainee finishes it.

## Git time travel

Use it when a regression needs a cause, lost work needs recovery, or a line needs its history.

Bisect between a known-good and a known-bad commit with a deterministic test. A flaky test marks the wrong commit. Blame, and a history search for when a string appeared, answers why code exists.

The reflog can recover a commit no branch points at, and it expires, which is why finished plans are tagged.

Take a backup branch before a rebase. If a force push is required, use the form that refuses to overwrite unseen remote commits. If a rebase sticks, abort it.

## Gitsaver

Gitsaver runs only when someone types the command and a new branch name, for example `/gitsaver next-exercise`. The sentence "save my work" does not start it.

Invoking it approves this sequence in the repository that contains the changes: classify files, commit named paths, push, open a pull request, squash-merge if checks allow, then create and push the named branch. It skips databases, `var/`, and secrets. It asks when a file is ambiguous. It stops on conflicts or a blocked merge. It does not commit on the default branch.

In a repo with nested git repositories it asks which one to save. This training repo is a single repository, so that case is documentation only.

## Worktrees are a different tool

Gitsaver moves the current checkout. A worktree is a second checkout. They are different tools. Do not create a worktree unless the user asks. See [code-graph-and-worktrees.md](code-graph-and-worktrees.md).
