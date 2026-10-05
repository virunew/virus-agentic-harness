# Configuration

## TOC

- [Purpose](#purpose)
- [Variables](#variables)
- [How a process loads them](#how-a-process-loads-them)
- [Python environment](#python-environment)
- [Rules](#rules)

## Purpose

Desk Clerk has two committed environment files and no secrets. This page is the configuration reference for the training application.

## Variables

`env.test` contains only:

```text
DESKCLERK_ENV=test
DESKCLERK_DB=var/test/deskclerk.sqlite
```

`env.demo` contains only:

```text
DESKCLERK_ENV=demo
DESKCLERK_DB=var/demo/deskclerk.sqlite
```

Both files are committed. `var/` is gitignored. Demo and human test databases live under `var/demo/` and `var/test/`. Automated tests do not use those paths. They create a temporary file and pass it in.

There is no file named `env`.

## How a process loads them

`src/deskclerk/env.py` loads the file the caller names. It has no default path and no fallback file. If `DESKCLERK_ENV` or `DESKCLERK_DB` is missing or blank, it raises. It does not invent a database path.

`scripts/activate_test_env.sh` is sourced. It activates `.venv` when that directory already exists, exports `env.test`, prints `DESKCLERK_ENV=test`, and returns an error otherwise. It does not create a database or a virtualenv.

A person clicking the page loads the demo file in the shell, for example `set -a && source env.demo && set +a`, then runs the batch and the status server. Tests must not do that.

## Python environment

Python is 3.11 or newer. The only third-party dependency is pytest, declared in `pyproject.toml`.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

The activate script picks up `.venv` on later runs. Do not commit `.venv/`.

## Rules

- Validate the variables the run needs. Fail when one is missing.
- Do not add a silent default database path.
- Tests and the live check inside tests use `env.test` only.
- Do not commit a database file.
