"""Read a JSON Lines file and print how many lines were accepted, skipped, or failed.

This file only parses arguments, opens the database, and counts results.
The acceptance rules live in batch_helpers/accept.py.
"""

import argparse
import os
import sqlite3
import sys
from pathlib import Path

from deskclerk.batch_helpers.accept import accept_line


def main(argv: list[str] | None = None) -> int:
    """Accept every non-empty line in --input and print three counts."""
    parser = argparse.ArgumentParser(prog="deskclerk.batch")
    parser.add_argument("--input", required=True)
    args = parser.parse_args(argv)
    db_path = os.environ.get("DESKCLERK_DB", "").strip()
    if not db_path:
        print("DESKCLERK_DB is not set", file=sys.stderr)
        return 1
    database = Path(db_path)
    # The demo database lives under var/, which is not created in git.
    database.parent.mkdir(parents=True, exist_ok=True)
    counts = {"accepted": 0, "skipped": 0, "failed": 0}
    conn = sqlite3.connect(database)
    try:
        with open(args.input, encoding="utf-8") as handle:
            for number, raw_line in enumerate(handle, start=1):
                if raw_line.strip() == "":
                    continue
                result = accept_line(conn, number, raw_line)
                counts[result] += 1
    finally:
        conn.close()
    print(
        "accepted={accepted} skipped={skipped} failed={failed}".format(**counts)
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
