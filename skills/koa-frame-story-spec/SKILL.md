---
name: koa-frame-story-spec
description: Validate or update the chronological KOA cinematic frame manifest and emit a deterministic versioned JSON and Markdown story snapshot.
---

# KOA Frame Story Spec

Treat `content/cinematic-frame-manifest.json` as the canonical frame-story source. Generated files are review artifacts, not a second editable manifest.

## Trigger

Use this skill when a KOA route's frame order, content, motion, tunables, evidence, rationale, or versioned cinematic snapshot must be specified or checked.

## Inputs

- Proposed frame change or a request to snapshot the current manifest.
- Snapshot version in `vNNNN-lowercase-slug` form.
- Git commit SHA representing the implementation state being recorded.
- Repository-relative evidence directory.
- Approval and provenance notes for any changed content, assets, translations, or relationships.

## Workflow

1. Read the cookbook, route design/spec, and complete canonical manifest before editing.
2. Check that frames are chronological and non-overlapping, route and locale coverage are explicit, and every frame has entry, exit, foreground, background, static features, motion features, tunables, Motion-off result, evidence, and rationale.
3. When a requested change is authorized, edit only the canonical manifest. Preserve intentional K/seal/A/O order, chapter holds, review gates, and semantic Motion-off content.
4. Run `node --test tests/frame-manifest.test.mjs`.
5. Generate the versioned pair with `node scripts/snapshot-cinematic-spec.mjs --version <version> --commit <sha> --evidence-dir <directory>`.
6. Rerun the same command and confirm no content changes. Then run it with `--finalize`; treat any stale or missing generated output as a defect to resolve before finalization.
7. Review both JSON and Markdown against the canonical manifest and report changed frame IDs and evidence gaps.

## Output

Return the canonical manifest path, snapshot JSON/Markdown paths, version, commit, ordered frame IDs, verification results, changed-frame summary, evidence gaps, and review-gated items.

## Verification

Require the frame-manifest test, documentation-sync test when available, second-run idempotence, a clean `--finalize` result, and a scoped diff showing generated JSON/Markdown agree with the canonical input.

## Approval boundary

The skill may edit local source and generate local documentation only within the requested scope. It cannot invent evidence, approve translations or relationships, publish, deploy, delete historical artifacts, modify external accounts, or treat a snapshot as browser proof without explicit approval and observation.
