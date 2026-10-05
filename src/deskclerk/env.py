"""Load a named environment file.

The caller chooses the path. This module does not pick a default file
and does not invent a database path.
"""

from pathlib import Path

# Both names are required. A blank value is the same as a missing one:
# the loader must not substitute a database path.
REQUIRED_VARIABLES = ("DESKCLERK_ENV", "DESKCLERK_DB")


class MissingEnvironmentVariable(RuntimeError):
    """Raised when the named file omits a variable the run needs."""


def load_env(path: str) -> dict[str, str]:
    """Read KEY=VALUE lines from path and return them.

    Raises MissingEnvironmentVariable when DESKCLERK_ENV or DESKCLERK_DB
    is absent or blank. The path argument is required; there is no default.
    """
    values: dict[str, str] = {}
    text = Path(path).read_text(encoding="utf-8")
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    missing = [key for key in REQUIRED_VARIABLES if not values.get(key)]
    if missing:
        names = ", ".join(missing)
        raise MissingEnvironmentVariable(f"missing required variable: {names}")
    return values
