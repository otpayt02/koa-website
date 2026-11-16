# Local vector index and source sync

## User outcome

Unlock the local Brain, list the complete public GitHub tree by remote metadata, scan accessible Drive text for KOA-related material, and search indexed content with local embeddings. Receive only one exact Signal group when it is linked and approved.

## Current architecture and scope

- Existing inbox routing remains the persistence boundary for connector records.
- GitHub listing reads the complete public branch tree as metadata only. Manual sync still reads recent commits/issues and the current selected source documents; semantic file discovery from GitHub requires fetching candidate file text.
- Drive defaults to `all_related`: it scans accessible supported text, Docs, and Sheets, evaluates titles and text with KOA domain concepts and the local embedding model, retains related revisions, and follows the Drive changes cursor. Set `GOOGLE_DRIVE_SCOPE=folder` to use the narrower approved-folder behavior.
- Signal stays behind the optional Compose profile and an exact group filter; linked account and group ID are pending.
- A private SQLite file holds text chunks and normalized local Ollama embeddings. A shared relevance profile records exact matched concepts and, when Ollama is available, cosine similarity to the KOA domain profile.

## Experience

1. The operator unlocks the localhost app with a token from ignored `.env`.
2. **Sync sources** starts a background run and reports completed, partial, or failed state.
3. New records are routed and indexed. Search returns attributed excerpts.
4. Drive can poll at a configurable interval, default 60 seconds; Signal and the GitHub webhook are event driven when configured.

## Safety

- The token, OAuth material, Signal state, and SQLite file stay out of Git.
- Raw executive Signal messages remain off until an exact group, linked account, consent, and retention policy are set.
- The index is not encrypted at rest or user scoped. Local operator access is a first gate, not a complete executive security model.
- No hosted embedding API is used. Ollama and both local models use the persistent `ollama_data` Compose volume. Drive polling defaults to 60 seconds.

## Proof

- Docker backend and frontend build.
- Ten backend checks and three connector checks run with synthetic data.
- Authenticated local GitHub sync and vector search run through the container.
- Live Drive OAuth and Signal group delivery remain pending external credentials and group details.

## Rollback

Revert the code commit and rebuild Docker. The ignored local `knowledge.sqlite3` and source inbox data remain on the host; remove them only after a separate data-retention decision.
