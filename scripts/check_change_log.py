#!/usr/bin/env python3
"""Require a changelog update for changes relative to a Git revision."""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
LOG = "docs/CHANGELOG.md"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base", help="Base commit; comparison includes tracked working-tree changes")
    args = parser.parse_args()
    try:
        subprocess.run(["git", "rev-parse", "--verify", args.base + "^{commit}"], cwd=ROOT,
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        changed = subprocess.check_output(["git", "diff", "--name-only", "-z", args.base, "--"], cwd=ROOT).decode().split("\0")
        untracked = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", "-z"], cwd=ROOT).decode().split("\0")
    except subprocess.CalledProcessError:
        print("FAIL: base revision unavailable; fetch it before checking documentation")
        return 1
    files = set(changed + untracked) - {""}
    if not files:
        print("PASS: no changes")
        return 0
    if LOG not in files or not (ROOT / LOG).is_file():
        print(f"FAIL: update {LOG} with changes, verification, status and pending work")
        return 1
    print("PASS: changelog updated; review the entry for completeness")
    return 0


if __name__ == "__main__":
    sys.exit(main())
