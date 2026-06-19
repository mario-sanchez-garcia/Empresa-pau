#!/usr/bin/env python3
"""
fix_latex.py — Fix single-backslash LaTeX commands in TypeScript data files.

Rule   : \cmd  →  \\cmd   (only when not already doubled)
Scope  : lines containing $ (math context indicator)
Skips  : lines starting with // or /* (TypeScript comments)
Backups: <file>.bak created before any modification
Log    : /tmp/latex_fixes.log
"""

import re
import os
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FILES = [
    "app/data/examenes.ts",
    "app/data/fisica.ts",
    "app/data/quimica.ts",
    "app/data/matematicas_ccss_madrid.ts",
    "app/data/examenes_cataluna.ts",
    "app/data/ingles.ts",
    "app/data/historia.ts",
]

# LaTeX command names — sorted longest-first so longer names win in alternation
COMMANDS = sorted([
    "displaystyle", "overline", "mathbb", "pmatrix", "bmatrix",
    "forall", "exists", "epsilon", "implies", "lambda",
    "approx", "infty", "theta", "sigma", "omega", "delta",
    "gamma", "alpha", "equiv", "dfrac", "cdots", "ldots",
    "bigl", "bigr", "frac", "sqrt", "text", "cdot",
    "beta", "left", "right", "begin", "matrix", "times",
    "qquad", "quad", "perp", "dots", "sim", "end",
    "vec", "det", "cap", "cup", "mid", "int",
    "sum", "lim", "leq", "geq", "neq", "iff",
    "parallel", "angle", "pm", "in", "pi", "mu",
], key=len, reverse=True)

# (?<!\\)  — not preceded by backslash (avoids touching \\cmd)
# \\       — matches the single \ in the file
# (cmd)    — captures the command name
# (?=...)  — lookahead: must be followed by non-letter, {, or end-of-string
ALT = "|".join(re.escape(c) for c in COMMANDS)
PATTERN = re.compile(r"(?<!\\)\\(" + ALT + r")(?=[^a-zA-Z]|$)")

LOG_PATH = "/tmp/latex_fixes.log"


def fix_line(line: str) -> str:
    # "\\\\" in Python = two backslash characters → written as \\ in file → correct TS escape
    return PATTERN.sub(lambda m: "\\\\" + m.group(1), line)


def process_file(rel_path: str, log: list) -> bool:
    full_path = os.path.join(PROJECT_ROOT, rel_path)

    if not os.path.exists(full_path):
        print(f"  SKIP — not found: {rel_path}")
        return False

    backup = full_path + ".bak"
    shutil.copy2(full_path, backup)
    print(f"  backup  → {os.path.basename(backup)}")

    with open(full_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    changed = 0

    for i, raw in enumerate(lines, 1):
        stripped = raw.lstrip()

        # Skip TypeScript comment lines
        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            new_lines.append(raw)
            continue

        # Only process lines that contain $ (math context)
        if "$" not in raw:
            new_lines.append(raw)
            continue

        fixed = fix_line(raw)
        if fixed != raw:
            log.append(f"FILE: {rel_path}  LINE {i}:")
            log.append(f"  BEFORE: {raw.rstrip()}")
            log.append(f"  AFTER:  {fixed.rstrip()}")
            log.append("")
            changed += 1

        new_lines.append(fixed)

    if changed:
        with open(full_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"  MODIFIED — {changed} line(s) changed")
        return True
    else:
        print(f"  clean — no changes needed")
        return False


def main():
    os.chdir(PROJECT_ROOT)
    print(f"Project root : {PROJECT_ROOT}")
    print(f"Commands     : {len(COMMANDS)}")
    print(f"Pattern      : {PATTERN.pattern[:80]}...\n")

    log: list = []

    for rel_path in FILES:
        print(f"→ {rel_path}")
        process_file(rel_path, log)
        print()

    with open(LOG_PATH, "w", encoding="utf-8") as f:
        if log:
            f.write("\n".join(log) + "\n")
        else:
            f.write("No changes — all files are already clean.\n")

    total = len([l for l in log if l.startswith("FILE:")])
    print(f"Log          : {LOG_PATH}")
    print(f"Lines changed: {total}")


if __name__ == "__main__":
    main()
