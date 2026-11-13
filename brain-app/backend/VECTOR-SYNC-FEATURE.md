# Local vector index and source sync

## User outcome

Unlock the local Brain, sync public GitHub and one approved Drive folder on demand, and search indexed records without hosted embeddings. Receive only one exact Signal group when it is linked and approved.

## Current architecture and scope

- Existing inbox routing remains the persistence boundary for connector records.
- GitHub manual sync reads recent public commits and issues; the signed webhook receiver remains available for a future narrow HTTPS ingress.
- Drive backfills direct supported files in the approved folder and then follows a cursor and current-revision scope. The dedicated Cloud project `koa-brain-drive` has Drive API enabled; OAuth client and token are pending.
- Signal stays behind the optional Compose profile and an exact group filter; linked account and group ID are pending.
- A private SQLite file holds text chunks and deterministic Unicode character vectors. Search is lexical, not validated semantic retrieval.

## Experience

1. The operator unlocks the localhost app with a token from ignored `.env`.
2. **Sync sources** starts a background run and reports completed, partial, or failed state.
3. New records are routed and indexed. Search returns attributed excerpts.
4. Drive can poll at a configurable interval, default 60 seconds; Signal and the GitHub webhook are event driven when configured.

## Safety

- The token, OAuth material, Signal state, and SQLite file stay out of Git.
- Raw executive Signal messages remain off until an exact group, linked account, consent, and retention policy are set.
- The index is not encrypted at rest or user scoped. Local operator access is a first gate, not a complete executive security model.
- No paid embedding API is used. A 15-second Drive interval is opt in after quota review.

## Proof

- Docker backend and frontend build.
- Ten backend checks and three connector checks run with synthetic data.
- Authenticated local GitHub sync and vector search run through the container.
- Live Drive OAuth and Signal group delivery remain pending external credentials and group details.

## Rollback

Revert the code commit and rebuild Docker. The ignored local `knowledge.sqlite3` and source inbox data remain on the host; remove them only after a separate data-retention decision.
