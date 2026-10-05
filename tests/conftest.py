"""Fail the session unless the process was loaded as the test environment."""

import os
from pathlib import Path

import pytest

from deskclerk.env import load_env

ROOT = Path(__file__).resolve().parents[1]


def pytest_sessionstart(session: pytest.Session) -> None:
    """Refuse a run that did not export the test environment.

    The loader still reads env.test, so a session cannot pass by pointing
    the process at the demo file. The process variable is the gate: pytest
    without scripts/activate_test_env.sh must fail.
    """
    env_name = os.environ.get("DESKCLERK_ENV")
    if env_name != "test":
        pytest.exit(
            "DESKCLERK_ENV must be test "
            f"(got {env_name!r}). Source scripts/activate_test_env.sh.",
            returncode=2,
        )
    loaded = load_env(str(ROOT / "env.test"))
    if loaded.get("DESKCLERK_ENV") != "test":
        pytest.exit("env.test must set DESKCLERK_ENV=test.", returncode=2)
