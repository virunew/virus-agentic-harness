# Execution Plans

## TOC

- [Who this file is for](#who-this-file-is-for)
- [When to write a plan](#when-to-write-a-plan)
- [File name and plan ID](#file-name-and-plan-id)
- [How to write](#how-to-write)
- [One goal](#one-goal)
- [Required sections](#required-sections)
- [Milestones and prototypes](#milestones-and-prototypes)
- [One-time scripts](#one-time-scripts)
- [Keeping the plan alive](#keeping-the-plan-alive)
- [Tags](#tags)

## Who this file is for

An execution plan, called an ExecPlan here, is for an agent with no memory of the design conversation. The reader is a novice who has the working tree and that one file. If a fact matters, the plan says it. The plan does not say "as discussed."

This file is the spec for those plans. Plans themselves live under `docs/plans/`.

## When to write a plan

Write an ExecPlan for work that is multi-step, easy to get wrong twice, or hard to resume. A direct answer or a one-step fix does not get a plan file.

Work that touches persistent data, the batch command, or the status page contract is a durable ExecPlan when it is more than a one-step fix.

## File name and plan ID

Every plan file:

- Is named `docs/plans/YYYY-MM-DD-NNN-slug-plan.md`
- Has a three-digit `NNN` unique across the whole `docs/plans/` tree, including any future `completed/` or `archive/` folder
- States `Plan ID: NNN` near the top
- Says it is governed by this file

Search `docs/plans/` before assigning `NNN`. Do not reuse a number after a file has used it, even if that plan is abandoned.

Related plans may later share a subfolder. A phase plan may sequence child plans. It must not absorb their work.

## How to write

Use prose. The only checklist is `Progress`.

Define any unusual term in the file, even when `docs/references/CONCEPTS.md` also defines it. A cold agent should not have to open the glossary to finish the plan.

State the outcome a person can observe, separate from the chosen approach. If the approach is already fixed, put it on a `Means:` line that points at the Decision Log.

Name real commands. When tests are involved, name `source scripts/activate_test_env.sh && pytest`. Show the working directory. The repository root is the usual place.

## One goal

One easily achievable goal per file. If a draft has two outcomes that could ship separately, stop and ask to split.

## Required sections

Use these sections, in this order.

| Section | Problem it solves |
| --- | --- |
| Purpose / Big Picture | Stops a plan that only describes code. Says what someone can do afterward and how to see it. If the approach is already fixed, put it on a `Means:` line that points at the Decision Log. |
| Progress | Lets a later session resume. Timestamped checkboxes. A half-done step is split into done and remaining. |
| Surprises & Discoveries | Keeps evidence that would die in chat, with a command transcript or a failing test name. |
| Decision Log | Stops re-deciding. Each entry has the decision, the rationale, and the date. |
| Outcomes & Retrospective | At a milestone, compares the result with the original purpose. |
| Context and Orientation | Teaches the current code. Names files. Does not say "as discussed". |
| Plan of Work | Says which file and which function change, in prose. It does not paste the finished patch. |
| Concrete Steps | Exact commands, the working directory, and a short expected transcript. |
| Validation and Acceptance | A behavior someone can check. Names the test command in the test environment, and which new test fails before the change and passes after. |
| Idempotence and Recovery | Which steps are safe to repeat, how to retry a halfway failure, and how to roll back anything destructive. |
| Artifacts and Notes | The short output that proves success. |
| Interfaces and Dependencies | The functions that must exist at the end, so the agent does not invent a second library. |

## Milestones and prototypes

Milestones, if used, tell a story: goal, work, result, proof. Progress remains the checkbox grain.

A prototype milestone is labeled as a prototype and says how to keep it or delete it.

## One-time scripts

If a plan needs a one-time script, put it at `scripts/adhoc/NNN-slug.py` and name that path in the plan. Long-lived scripts, such as `scripts/activate_test_env.sh`, stay where they are. Reusable behavior stays in `src/deskclerk/`. The first build of Desk Clerk needs no adhoc script.

## Keeping the plan alive

Update the plan when the work proceeds. Check a box when the step is done. When a step is half done, split it into a done part and a remaining part. When the plan is revised, add a note at the bottom that says what changed and why.

Each Decision Log entry has the decision, the rationale, and the date.

## Tags

After the commit that finishes a plan, create a local annotated tag `plan-NNN-short-name`. Do not push it unless the user asks. Ordinary commits are not tagged. Do not tag the docs-only commits that led up to the code unless they are the finishing commit.
