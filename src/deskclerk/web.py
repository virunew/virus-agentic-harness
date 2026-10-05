"""One-page status view of the ticket ledger.

The page is a single HTML document from the standard library.
It reads the same SQLite file the batch command writes.
"""

import argparse
import html
import os
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    """Serve GET / until the process is stopped."""
    parser = argparse.ArgumentParser(prog="deskclerk.web")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args(argv)
    db_path = os.environ.get("DESKCLERK_DB", "").strip()
    if not db_path:
        print("DESKCLERK_DB is not set", file=sys.stderr)
        return 1
    database = Path(db_path)
    database.parent.mkdir(parents=True, exist_ok=True)

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            path = self.path.split("?", 1)[0]
            if path != "/":
                self._send(404, "text/plain; charset=utf-8", b"Not found")
                return
            page = render_page(database).encode("utf-8")
            self._send(200, "text/html; charset=utf-8", page)

        def _send(self, status: int, content_type: str, body: bytes) -> None:
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    try:
        server.serve_forever()
    finally:
        server.server_close()
    return 0


def render_page(database: Path) -> str:
    """Return the status HTML for the current database, including an empty one."""
    accepted, failed, rows = _read_ledger(database)
    body_rows = "\n".join(_failure_row(row) for row in rows)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Desk Clerk</title>
  <style>
    body {{
      margin: 0;
      background: #f3efe4;
      color: #221c14;
      font-family: "Iowan Old Style", Palatino, Georgia, serif;
    }}
    main {{
      max-width: 38rem;
      margin: 0 auto;
      padding: 1.25rem 1rem 2.5rem;
    }}
    h1 {{
      margin: 0 0 0.35rem;
      font-size: 2rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }}
    p {{
      margin: 0.35rem 0;
      line-height: 1.45;
    }}
    .ledger {{
      margin-top: 1.25rem;
      padding-top: 0.75rem;
      border-top: 2px solid #1f4d3a;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
    }}
    th, td {{
      text-align: left;
      vertical-align: top;
      padding: 0.45rem 0.35rem;
      border-bottom: 1px solid #d9d0c2;
      overflow-wrap: anywhere;
    }}
    th {{
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }}
    /* One table, stacked on a phone so long identities stay whole words. */
    @media (max-width: 40rem) {{
      thead {{
        display: none;
      }}
      tr {{
        display: block;
        padding: 0.55rem 0 0.7rem;
        border-bottom: 1px solid #d9d0c2;
      }}
      td {{
        display: block;
        border: 0;
        padding: 0.12rem 0;
      }}
      td::before {{
        content: attr(data-label);
        display: block;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }}
    }}
  </style>
</head>
<body>
  <main>
    <h1>Desk Clerk</h1>
    <p>Tickets on the ledger, and the lines that still need a person.</p>
    <div class="ledger">
      <p>Accepted {accepted}</p>
      <p>Failed {failed}</p>
      <table>
        <thead>
          <tr><th>Failure class</th><th>Program</th><th>Ticket</th></tr>
        </thead>
        <tbody>
          {body_rows}
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>
"""


def _failure_row(row: tuple[str, str, str]) -> str:
    labels = ("Failure class", "Program", "Ticket")
    cells = "".join(
        f'<td data-label="{html.escape(label)}">{html.escape(value)}</td>'
        for label, value in zip(labels, row)
    )
    return f"<tr>{cells}</tr>"


def _read_ledger(database: Path) -> tuple[int, int, list[tuple[str, str, str]]]:
    conn = sqlite3.connect(database)
    try:
        accepted = _count(conn, "tickets")
        failed = _count(conn, "failures")
        if not _has_table(conn, "failures"):
            return accepted, failed, []
        rows = conn.execute(
            """
            SELECT failure_class, program, ticket_id
            FROM failures
            ORDER BY failure_class, ticket_id
            """
        ).fetchall()
        return accepted, failed, rows
    finally:
        conn.close()


def _has_table(conn: sqlite3.Connection, name: str) -> bool:
    found = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (name,),
    ).fetchone()
    return found is not None


def _count(conn: sqlite3.Connection, name: str) -> int:
    if not _has_table(conn, name):
        return 0
    row = conn.execute(f"SELECT COUNT(*) FROM {name}").fetchone()
    return int(row[0])


if __name__ == "__main__":
    raise SystemExit(main())
