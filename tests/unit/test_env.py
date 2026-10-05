"""Behavior of the named-file environment loader."""

import pytest

from deskclerk.env import load_env


def test_missing_variable_raises(tmp_path):
    """A file that omits a required name fails instead of inventing a path."""
    env_file = tmp_path / "partial.env"
    env_file.write_text("DESKCLERK_ENV=test\n", encoding="utf-8")
    with pytest.raises(Exception) as caught:
        load_env(str(env_file))
    assert "DESKCLERK_DB" in str(caught.value)


def test_load_env_test_file():
    """The committed test file names the test environment."""
    loaded = load_env("env.test")
    assert loaded["DESKCLERK_ENV"] == "test"
