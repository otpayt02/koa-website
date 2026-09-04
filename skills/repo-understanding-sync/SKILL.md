---
name: repo-understanding-sync
description: Synchronize the marked generated registry in KOA UNDERSTANDING.md after repository changes while preserving every human-maintained note.
---

# Repository Understanding Sync

The registry is curated, not a dump of generated files. Explain top-level operating boundaries and group detailed generated output under its owning path.

## Trigger

Use this skill after a KOA change adds, removes, or materially changes a top-level repository path, its owner, consumers, failure mode, verification command, or approval/privacy boundary.

## Inputs

- Repository root and current Git status.
- Changed paths and the verified purpose of each change.
- Owner, consumers, removal impact, generated/manual status, verification command, and approval/privacy boundary for any new or changed top-level path.
- Human context that must remain outside the generated markers.

## Workflow

1. Read `UNDERSTANDING.md`, `scripts/update-understanding.mjs`, repository instructions, and `git status` before editing.
2. Preserve all text outside `<!-- BEGIN GENERATED REPOSITORY REGISTRY -->` and `<!-- END GENERATED REPOSITORY REGISTRY -->` byte for byte.
3. Update the curated registry in `scripts/update-understanding.mjs` only when repository evidence changes an entry. Add a specific entry for every new tracked top-level path; do not generate one row per build artifact.
4. Run `node scripts/update-understanding.mjs`, inspect the marked section, then rerun the command.
5. Run `node scripts/update-understanding.mjs --check` and `node --test tests/documentation-sync.test.mjs`.
6. Compare the scoped diff and confirm human notes, unrelated dirty files, secrets, and approval boundaries remain unchanged.

## Output

Return changed registry entries, preserved human sections, generator/test results, idempotence result, scoped diff paths, and any top-level path whose purpose or owner remains unknown.

## Verification

Require every tracked first-party top-level path plus `UNDERSTANDING.md` to appear once with all registry fields populated. A passing handoff includes a clean `--check` run and no second-run diff.

## Approval boundary

This skill may update local documentation and its deterministic generator within the requested scope. It must not rewrite human notes, expose secrets or private data, delete paths, change credentials, deploy, publish, push, create external accounts, or infer authority for an unknown owner or boundary.
