# Code Graph And Worktrees

## TOC

- [Purpose](#purpose)
- [Map, then read](#map-then-read)
- [Worktrees](#worktrees)

## Purpose

Two tools are easy to confuse with the glossary and with ordinary git. A code knowledge graph answers how parts connect. A git worktree is a second working directory for this same repository. Neither is the default path for a one-step fix.

## Map, then read

Query the graph, then read the files it names before an edit. Text search is the right tool for an exact error string or a known file. If the graph is not installed, use text search and reading. Do not make the tests or the demo depend on the graph. After code changes, update the graph if it is installed.

The graph is not `docs/references/CONCEPTS.md`. Do not merge them.

This repository does not install a graph in the first build.

## Worktrees

A worktree is useful for a risky experiment that must not disturb the current checkout. It is not the default. Do not create or switch a worktree unless the user asks, or approves one after you explain why isolation would help. Do not infer approval from the kind of task.

The first build does not create a worktree. Plan 002 does not get one either. Implementing that plan is a change to `web.py` and a test, on the current checkout.

Gitsaver, described in [git.md](git.md), moves the current checkout. A worktree is a second checkout. They are different tools.
