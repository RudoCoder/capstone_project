import os
import yara

# ── Path Resolution ────────────────────────────────────────────────────────────
# Resolves to: backend/threat_intel/yara_rules_repo/
# Place your cloned YARA rules repo there and name it "yara_rules_repo".
# Structure: yara_rules_repo/antidebug_antivm/, yara_rules_repo/cve_rules/, etc.
_BACKEND_ROOT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
)
LOCAL_REPO_PATH = os.path.join(_BACKEND_ROOT, "yara_rules_repo")

# Process-lifetime cache — recompiling on every scan is extremely slow
_compiled_rules_cache = None


def invalidate_cache():
    """Call this after updating the rules repo to force a recompile."""
    global _compiled_rules_cache
    _compiled_rules_cache = None


def compile_yara_rules():
    """
    Walk LOCAL_REPO_PATH, compile each .yar/.yara file individually,
    skip any files that fail (missing modules, syntax errors, etc.).
    Returns a list of compiled yara.Rules objects.
    Result is cached for the lifetime of the process.
    """
    global _compiled_rules_cache
    if _compiled_rules_cache is not None:
        return _compiled_rules_cache

    if not os.path.exists(LOCAL_REPO_PATH):
        print(
            f"[YARA] WARNING: Rules directory not found at {LOCAL_REPO_PATH}. "
            "Unzip rules.zip into backend/threat_intel/ and rename the folder "
            "to 'yara_rules_repo', then restart the server."
        )
        _compiled_rules_cache = []
        return []

    compiled = []
    skipped  = 0

    for root, _, files in os.walk(LOCAL_REPO_PATH):
        if ".git" in root:          # skip git internals
            continue
        for filename in files:
            if not (filename.endswith(".yar") or filename.endswith(".yara")):
                continue
            full_path = os.path.join(root, filename)
            try:
                rules = yara.compile(filepath=full_path)
                compiled.append(rules)
            except (yara.SyntaxError, yara.Error):
                skipped += 1
            except Exception:
                skipped += 1

    print(
        f"[YARA] Compiled {len(compiled)} rule files, "
        f"skipped {skipped} (syntax errors / missing modules)."
    )
    _compiled_rules_cache = compiled
    return compiled


def scan_file_with_yara(file_path):
    """
    Scan a file against all compiled YARA rules.
    Returns a list of dicts: {rule, tags, meta}.
    """
    compiled_rules = compile_yara_rules()

    if not compiled_rules:
        print("[YARA] No compiled rules available — skipping scan.")
        return []

    if not os.path.exists(file_path):
        print(f"[YARA] File not found for scanning: {file_path}")
        return []

    results = []
    for rules in compiled_rules:
        try:
            matches = rules.match(file_path, timeout=10)
            for match in matches:
                results.append({
                    "rule": match.rule,
                    "tags": list(match.tags),
                    "meta": dict(match.meta),
                })
        except yara.TimeoutError:
            pass
        except Exception as e:
            print(f"[YARA] Match error: {e}")

    return results
