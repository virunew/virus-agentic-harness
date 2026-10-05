"""Acceptance rules for one ticket line.

Callers pass a connection, a 1-based line number, and the line text.
Parsing, the three failure classes, and the ticket and failure writes
stay in this module.
"""

import json
import re
from datetime import datetime, timezone

# Ticket ids are short slugs. Anything else is invalid_id, not a ticket.
ID_PATTERN = re.compile(r"^[a-z0-9-]{1,40}$")

# The batch command is the program name stored on every failure row.
PROGRAM = "deskclerk.batch"


def accept_line(conn, line_number: int, line: str) -> str:
    """Accept one line, skip a known ticket, or record one failure."""
    _ensure_schema(conn)
    try:
        payload = json.loads(line)
    except json.JSONDecodeError:
        payload = None
    # A JSON array or string is still not a ticket object.
    if not isinstance(payload, dict):
        _upsert_failure(conn, "unreadable_line", f"line-{line_number}", "not a JSON object")
        return "failed"
    id_failure = _id_failure(payload, line_number)
    if id_failure is not None:
        identity, detail = id_failure
        _upsert_failure(conn, "invalid_id", identity, detail)
        return "failed"
    field_detail = _field_failure(payload)
    if field_detail is not None:
        _upsert_failure(conn, "invalid_ticket", payload["ticket_id"], field_detail)
        return "failed"
    # ON CONFLICT DO NOTHING leaves the stored desk and body unchanged.
    # rowcount is 0 when the primary key is already present.
    cursor = conn.execute(
        """
        INSERT INTO tickets (ticket_id, desk, body, accepted_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(ticket_id) DO NOTHING
        """,
        (payload["ticket_id"], payload["desk"], payload["body"], _now()),
    )
    if cursor.rowcount == 0:
        conn.commit()
        return "skipped"
    # A corrected line retires failures for this ticket id only.
    # line-N unreadable rows use a different identity, so they stay.
    conn.execute(
        "DELETE FROM failures WHERE ticket_id = ?",
        (payload["ticket_id"],),
    )
    conn.commit()
    return "accepted"


def _id_failure(payload: dict, line_number: int) -> tuple[str, str] | None:
    """Return the failure identity and detail when ticket_id cannot be stored."""
    raw_id = payload.get("ticket_id")
    if not isinstance(raw_id, str):
        # There is no string id to store, so the line number keeps the row stable.
        return (f"line-{line_number}", "ticket_id is missing")
    if ID_PATTERN.fullmatch(raw_id) is None:
        return (raw_id, "ticket_id does not match ^[a-z0-9-]{1,40}$")
    return None


def _field_failure(payload: dict) -> str | None:
    """Return why desk or body cannot be stored, or None when both are usable."""
    limits = {"desk": 40, "body": 500}
    for name, limit in limits.items():
        value = payload.get(name)
        if not isinstance(value, str):
            return f"{name} is missing"
        if value == "":
            return f"{name} is empty"
        if len(value) > limit:
            return f"{name} is too long"
    return None


def _upsert_failure(conn, failure_class: str, ticket_id: str, detail: str) -> None:
    """Insert or update one failure identity. The same identity stays one row."""
    conn.execute(
        """
        INSERT INTO failures (
            failure_class, program, ticket_id, detail, updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(failure_class, program, ticket_id) DO UPDATE SET
            detail = excluded.detail,
            updated_at = excluded.updated_at
        """,
        (failure_class, PROGRAM, ticket_id, detail, _now()),
    )
    conn.commit()


def _ensure_schema(conn) -> None:
    """Create the two ledger tables. Repeated calls leave existing rows."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tickets (
            ticket_id TEXT PRIMARY KEY,
            desk TEXT NOT NULL,
            body TEXT NOT NULL,
            accepted_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS failures (
            failure_class TEXT NOT NULL,
            program TEXT NOT NULL,
            ticket_id TEXT NOT NULL,
            detail TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (failure_class, program, ticket_id)
        )
        """
    )


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
