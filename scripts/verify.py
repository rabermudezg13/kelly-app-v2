#!/usr/bin/env python3
"""Local/CI verification. Never connects to the application's configured database."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "kelly-app-v2/backend"
FRONTEND = ROOT / "kelly-app-v2/frontend"
BASELINE = ROOT / "scripts/typescript-baseline.json"


def diagnostics(output):
    # Ignore line/column shifts, but preserve file, error code, message and count.
    return Counter(re.sub(r"\(\d+,\d+\)", "", line.strip())
                   for line in output.splitlines() if re.search(r"error TS\d+:", line))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--python", default=sys.executable, help="Backend virtualenv Python")
    args = parser.parse_args()
    report_dir = ROOT / ".harness"
    report_dir.mkdir(exist_ok=True)
    results = []

    with tempfile.TemporaryDirectory(prefix="kelly-harness-") as temporary:
        env = os.environ.copy()
        env.update(DATABASE_URL="sqlite:///" + str(Path(temporary) / "test.db"),
                   ADMIN_EMAIL="harness@example.com", ADMIN_PASSWORD="harness-local-only",
                   SECRET_KEY="harness-local-test-key-not-for-production",
                   PYTHONPATH=str(BACKEND), PYTHON_DOTENV_DISABLED="1")

        def run(name, command, cwd, check=None):
            print(f"[{name}] running", flush=True)
            try:
                completed = subprocess.run(command, cwd=cwd, env=env, text=True,
                                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                           timeout=300)
                output = completed.stdout
                passed, detail = check(completed.returncode, output) if check else (
                    completed.returncode == 0, f"exit={completed.returncode}")
            except (OSError, subprocess.TimeoutExpired) as error:
                output = f"Unable to run check: {type(error).__name__}: {error}"
                passed, detail = False, "execution failed or timed out"
            (report_dir / f"{name}.log").write_text(output)
            results.append({"name": name, "passed": passed, "detail": detail})
            print(f"[{name}] {'PASS' if passed else 'FAIL'}: {detail}", flush=True)

        run("backend-tests", [args.python, "-m", "pytest", str(BACKEND / "tests"), "-q"], temporary)
        run("postgres-drivers", [args.python, "-c", "from sqlalchemy import create_engine; "
            "[create_engine('postgresql+' + driver + '://test:test@127.0.0.1/test').dispose() "
            "for driver in ('psycopg', 'psycopg2')]; print('Both PostgreSQL drivers import; no connection attempted')"], temporary)
        run("backend-startup", [args.python, "-c", "from fastapi.testclient import TestClient; "
            "from main import app; "
            "client = TestClient(app); response = client.get('/health'); "
            "assert response.status_code == 200, response.status_code; print('Startup and health OK')"], temporary)
        run("frontend-build", ["npm", "run", "build"], FRONTEND)

        def check_types(code, output):
            actual = diagnostics(output)
            known = Counter(json.loads(BASELINE.read_text())["diagnostics"])
            added = actual - known
            removed = known - actual
            passed = code in (0, 1, 2) and not added and (code == 0 or bool(actual))
            detail = f"{sum(actual.values())} known diagnostics; {sum(added.values())} new; {sum(removed.values())} resolved"
            if added:
                detail += "; " + "; ".join(added)
            return passed, detail

        run("typescript-regressions", ["node", "node_modules/typescript/bin/tsc", "--noEmit", "--pretty", "false"], FRONTEND, check_types)

    passed = all(result["passed"] for result in results)
    report = {"timestamp": datetime.now(timezone.utc).isoformat(), "passed": passed,
              "checks": results, "limits": ["SQLite tests, not PostgreSQL integration",
              "No browser or authenticated production session tested",
              "Known TypeScript diagnostics tolerated, not a clean typecheck"]}
    (report_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    lines = ["# Harness verification", "", f"Result: {'PASS' if passed else 'FAIL'}", ""]
    lines += [f"- {'PASS' if row['passed'] else 'FAIL'} {row['name']}: {row['detail']}" for row in results]
    lines += ["", "## Limits", ""] + [f"- {limit}" for limit in report["limits"]]
    (report_dir / "report.md").write_text("\n".join(lines) + "\n")
    print("Reports: .harness/report.md and .harness/report.json")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
