import os
import yara
from git import Repo

YARA_REPO_URL = "https://github.com/yara-rules/rules"
# Absolute path: always resolves to threat_intel/yara_rules_repo/ regardless of cwd
LOCAL_REPO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "yara_rules_repo")
LOCAL_REPO_PATH = os.path.normpath(LOCAL_REPO_PATH)

# Cache compiled rules for the lifetime of the process — recompiling on every
# scan is extremely slow (walks the entire repo each time).
_compiled_rules_cache = None


def update_yara_rules():
    """
    Clone or update YARA rules repo and invalidate the rule cache.
    """
    global _compiled_rules_cache
    try:
        if not os.path.exists(LOCAL_REPO_PATH):
            Repo.clone_from(YARA_REPO_URL, LOCAL_REPO_PATH)
        else:
            repo = Repo(LOCAL_REPO_PATH)
            repo.remotes.origin.pull()
        _compiled_rules_cache = None  # force recompile after update
    except Exception as e:
        print(f"YARA repo update error: {e}")


def compile_yara_rules():
    """
    Compile YARA rules one file at a time, skipping any that fail to compile.
    Returns a list of compiled rule objects (one per valid file).
    Result is cached for the lifetime of the process.
    """
    global _compiled_rules_cache
    if _compiled_rules_cache is not None:
        return _compiled_rules_cache

    compiled = []
    skipped = 0

    for root, _, files in os.walk(LOCAL_REPO_PATH):
        for file in files:
            if not (file.endswith(".yar") or file.endswith(".yara")):
                continue
            full_path = os.path.join(root, file)
            try:
                rules = yara.compile(filepath=full_path)
                compiled.append(rules)
            except (yara.SyntaxError, yara.Error):
                skipped += 1
            except Exception:
                skipped += 1

    print(f"[YARA] Compiled {len(compiled)} rule files, skipped {skipped} (missing modules or syntax errors).")
    _compiled_rules_cache = compiled
    return compiled


def scan_file_with_yara(file_path):
    """
    Scan file against all compiled YARA rules.
    """
    compiled_rules = compile_yara_rules()

    if not compiled_rules:
        print("[YARA] No rules compiled — skipping scan.")
        return []

    results = []
    for rules in compiled_rules:
        try:
            matches = rules.match(file_path)
            for match in matches:
                results.append({
                    "rule": match.rule,
                    "tags": match.tags,
                    "meta": match.meta,
                })
        except Exception as e:
            print(f"[YARA] Match error: {e}")

    return results
