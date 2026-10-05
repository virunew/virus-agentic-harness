"""Batch re-runs and the status page, through the real commands."""

import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SAMPLE = ROOT / "samples" / "tickets.jsonl"


def _env(db_path: Path) -> dict[str, str]:
    """Point a child process at a temporary database, never the demo file."""
    env = os.environ.copy()
    env["DESKCLERK_ENV"] = "test"
    env["DESKCLERK_DB"] = str(db_path)
    src = str(ROOT / "src")
    current = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = src if not current else src + os.pathsep + current
    return env


def _run_batch(sample: Path, env: dict[str, str]) -> str:
    result = subprocess.run(
        [sys.executable, "-m", "deskclerk.batch", "--input", str(sample)],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    return result.stdout.strip()


def _free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _wait_get(port: int) -> tuple[int, str]:
    url = f"http://127.0.0.1:{port}/"
    deadline = time.time() + 5
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                return response.status, response.read().decode("utf-8")
        except (urllib.error.URLError, ConnectionError, TimeoutError) as exc:
            last_error = exc
            time.sleep(0.05)
    raise AssertionError(f"status page did not answer: {last_error}")


def _start_web(env: dict[str, str], port: int) -> subprocess.Popen[str]:
    return subprocess.Popen(
        [sys.executable, "-m", "deskclerk.web", "--port", str(port)],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def _stop(proc: subprocess.Popen[str]) -> None:
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait(timeout=5)


def test_second_batch_skips_and_status_page_lists_failures(tmp_path):
    """The sample file accepts two tickets, and a second run skips them."""
    db_path = tmp_path / "clerk.sqlite"
    assert "var/demo" not in str(db_path)
    assert "var/test" not in str(db_path)
    sample = tmp_path / "tickets.jsonl"
    sample.write_bytes(SAMPLE.read_bytes())
    env = _env(db_path)

    assert _run_batch(sample, env) == "accepted=2 skipped=0 failed=2"
    assert _run_batch(sample, env) == "accepted=0 skipped=2 failed=2"

    port = _free_port()
    proc = _start_web(env, port)
    try:
        status, body = _wait_get(port)
    finally:
        _stop(proc)

    assert status == 200
    assert "Accepted 2" in body
    assert "Failed 2" in body
    assert "invalid_id" in body
    assert "invalid_ticket" in body
    assert "NOT VALID" in body
    assert "note-3" in body
    # Plan 002 is the change that shows failure detail. This page must not.
    assert "body is empty" not in body


def test_empty_database_status_page(tmp_path):
    """An empty database is a normal page with zero counts."""
    db_path = tmp_path / "empty.sqlite"
    env = _env(db_path)
    port = _free_port()
    proc = _start_web(env, port)
    try:
        status, body = _wait_get(port)
    finally:
        _stop(proc)
    assert status == 200
    assert "Accepted 0" in body
    assert "Failed 0" in body
    assert "Traceback" not in body
