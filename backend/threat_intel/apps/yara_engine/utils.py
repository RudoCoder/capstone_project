import os
import yara
from git import Repo

YARA_REPO_URL = "https://github.com/yara-rules/rules"
LOCAL_REPO_PATH = "yara_rules_repo"


def update_yara_rules():
    """
    Clone or update YARA rules repo
    """
    try:
        if not os.path.exists(LOCAL_REPO_PATH):
            Repo.clone_from(YARA_REPO_URL, LOCAL_REPO_PATH)
        else:
            repo = Repo(LOCAL_REPO_PATH)
            repo.remotes.origin.pull()
    except Exception as e:
        print(f"YARA repo update error: {e}")


def compile_yara_rules():
    """
    Compile all YARA rules
    """
    rule_files = {}

    for root, _, files in os.walk(LOCAL_REPO_PATH):
        for file in files:
            if file.endswith(".yar") or file.endswith(".yara"):
                full_path = os.path.join(root, file)
                rule_files[file] = full_path

    if not rule_files:
        return None

    return yara.compile(filepaths=rule_files)


def scan_file_with_yara(file_path):
    """
    Scan file using compiled YARA rules
    """
    try:
        rules = compile_yara_rules()
        if not rules:
            return []

        matches = rules.match(file_path)

        results = []
        for match in matches:
            results.append({
                "rule": match.rule,
                "tags": match.tags,
                "meta": match.meta
            })

        return results

    except Exception as e:
        print(f"YARA scan error: {e}")
        return []
