"""Behavior of accept_line against an in-memory ledger."""

import sqlite3

from deskclerk.batch_helpers.accept import accept_line

VALID_LINE = '{"ticket_id":"lamp-1","desk":"front","body":"Replace the lobby lamp."}'


def _connection() -> sqlite3.Connection:
    return sqlite3.connect(":memory:")


def test_accepts_a_valid_line():
    """A well-formed line becomes one ticket row."""
    conn = _connection()
    assert accept_line(conn, 1, VALID_LINE) == "accepted"
    row = conn.execute("SELECT ticket_id, desk, body FROM tickets").fetchone()
    assert row == ("lamp-1", "front", "Replace the lobby lamp.")


def test_second_accept_skips():
    """A ticket id that is already accepted is not stored again."""
    conn = _connection()
    assert accept_line(conn, 1, VALID_LINE) == "accepted"
    changed = '{"ticket_id":"lamp-1","desk":"mail","body":"A different body."}'
    assert accept_line(conn, 2, changed) == "skipped"
    count = conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0]
    assert count == 1
    row = conn.execute("SELECT desk, body FROM tickets").fetchone()
    assert row == ("front", "Replace the lobby lamp.")


def test_unreadable_line_uses_line_number():
    """A line that is not a JSON object is one failure keyed by line-N."""
    conn = _connection()
    assert accept_line(conn, 4, "this is not json") == "failed"
    row = conn.execute(
        "SELECT failure_class, program, ticket_id FROM failures"
    ).fetchone()
    assert row == ("unreadable_line", "deskclerk.batch", "line-4")
    assert conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 0
    assert accept_line(conn, 5, "[1, 2, 3]") == "failed"
    array_row = conn.execute(
        "SELECT failure_class, ticket_id FROM failures WHERE ticket_id = 'line-5'"
    ).fetchone()
    assert array_row == ("unreadable_line", "line-5")


def test_invalid_id_records_the_bad_identifier():
    """A ticket id outside the pattern is a failure, not a ticket."""
    conn = _connection()
    line = '{"ticket_id":"NOT VALID","desk":"front","body":"Capitals and a space."}'
    assert accept_line(conn, 3, line) == "failed"
    row = conn.execute(
        "SELECT failure_class, program, ticket_id FROM failures"
    ).fetchone()
    assert row == ("invalid_id", "deskclerk.batch", "NOT VALID")
    assert conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 0


def test_missing_id_uses_the_line_number():
    """An object with no ticket_id is invalid_id, keyed by line-N."""
    conn = _connection()
    line = '{"desk":"front","body":"No identifier."}'
    assert accept_line(conn, 2, line) == "failed"
    row = conn.execute(
        "SELECT failure_class, ticket_id FROM failures"
    ).fetchone()
    assert row == ("invalid_id", "line-2")


def test_empty_body_is_invalid_ticket():
    """A valid id with an empty body is a ticket failure, not an accepted row."""
    conn = _connection()
    line = '{"ticket_id":"note-3","desk":"front","body":""}'
    assert accept_line(conn, 4, line) == "failed"
    row = conn.execute(
        "SELECT failure_class, program, ticket_id, detail FROM failures"
    ).fetchone()
    assert row == ("invalid_ticket", "deskclerk.batch", "note-3", "body is empty")
    assert conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 0


def test_same_failure_identity_updates():
    """The same failure identity updates one row instead of inserting another."""
    conn = _connection()
    empty = '{"ticket_id":"note-3","desk":"front","body":""}'
    too_long = '{"ticket_id":"note-3","desk":"front","body":"' + ("x" * 501) + '"}'
    assert accept_line(conn, 1, empty) == "failed"
    assert accept_line(conn, 2, too_long) == "failed"
    rows = conn.execute("SELECT detail FROM failures").fetchall()
    assert rows == [("body is too long",)]


def test_valid_line_deletes_prior_failure_for_same_id():
    """A later valid line for a failed id accepts it and removes that failure."""
    conn = _connection()
    bad = '{"ticket_id":"note-3","desk":"front","body":""}'
    good = '{"ticket_id":"note-3","desk":"front","body":"Leave a note."}'
    assert accept_line(conn, 1, bad) == "failed"
    assert accept_line(conn, 2, good) == "accepted"
    remaining = conn.execute(
        "SELECT COUNT(*) FROM failures WHERE ticket_id = 'note-3'"
    ).fetchone()[0]
    assert remaining == 0
    assert conn.execute("SELECT body FROM tickets").fetchone() == ("Leave a note.",)


def test_valid_ticket_does_not_clear_unreadable_line():
    """A line-numbered unreadable failure stays until a person removes it."""
    conn = _connection()
    assert accept_line(conn, 4, "not json") == "failed"
    assert accept_line(conn, 5, VALID_LINE) == "accepted"
    row = conn.execute("SELECT failure_class, ticket_id FROM failures").fetchone()
    assert row == ("unreadable_line", "line-4")
