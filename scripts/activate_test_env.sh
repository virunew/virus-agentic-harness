#!/usr/bin/env bash
# Load the Desk Clerk test environment.
# Source this file. Running it as a program will not export variables
# into the calling shell.
#
# The script does not create a database, a virtualenv, or a fallback
# environment file. It only activates .venv when that directory already
# exists, then exports env.test.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "Source this script: source scripts/activate_test_env.sh" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "${repo_root}/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "${repo_root}/.venv/bin/activate"
fi

set -a
# shellcheck disable=SC1091
source "${repo_root}/env.test"
set +a

if [[ "${DESKCLERK_ENV}" != "test" ]]; then
  echo "DESKCLERK_ENV must be test, got '${DESKCLERK_ENV:-}'" >&2
  return 1
fi

echo "DESKCLERK_ENV=test"
