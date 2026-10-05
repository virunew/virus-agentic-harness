# Desk Clerk

Desk Clerk reads a JSON Lines file of tickets, keeps the valid ones, and records the lines it could not accept. Running the same file again does not store a ticket twice. A one-page status view shows how many tickets are accepted and which failures are still on record.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
source scripts/activate_test_env.sh && pytest
```

Demo, from the repository root, after the install above:

```bash
source .venv/bin/activate
set -a && source env.demo && set +a
python -m deskclerk.batch --input samples/tickets.jsonl
python -m deskclerk.web --port 8765
```

Open `http://127.0.0.1:8765/`. The demo database is `var/demo/`. Tests never use it.

The method lives in [docs/references/agent-operating-policy.md](docs/references/agent-operating-policy.md). The bootstrap spec is [docs/initial/implementation-spec.md](docs/initial/implementation-spec.md).
