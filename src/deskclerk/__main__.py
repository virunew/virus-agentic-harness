"""Usage note for `python -m deskclerk`."""


def main() -> int:
    print("Desk Clerk")
    print("  python -m deskclerk.batch --input samples/tickets.jsonl")
    print("  python -m deskclerk.web --port 8765")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
